import { spawn } from "node:child_process";
import { storyUrlSchema } from "@/lib/validators";

const YT_DLP_BIN = "yt-dlp";
const NEEDS_AUTH_MESSAGE =
  "Instagram login is required to download stories. Coming soon.";

type StoryItem = {
  id: string;
  filename: string;
  proxyUrl: string;
  type: "video" | "image";
  width: number;
  height: number;
  thumbnailUrl: string;
};

type StoryManifest = {
  items: StoryItem[];
};

type StoryBody = {
  url?: unknown;
};

type RawYtDlpEntry = {
  url?: string;
  title?: string;
  ext?: string;
  width?: number;
  height?: number;
  thumbnail?: string;
  _type?: string;
};

type RawYtDlpInfo = {
  _type?: string;
  entries?: RawYtDlpEntry[];
};

const PROXY_ENDPOINT = "/api/image-proxy?src=";

export async function POST(request: Request): Promise<Response> {
  const cookiesFile = process.env.INSTAGRAM_COOKIES_FILE;
  if (!cookiesFile) {
    return Response.json(
      { error: NEEDS_AUTH_MESSAGE, needsAuth: true },
      { status: 401 },
    );
  }

  let body: StoryBody;
  try {
    body = (await request.json()) as StoryBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = storyUrlSchema.safeParse(body.url);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid URL" },
      { status: 400 },
    );
  }

  const info = await fetchStoryInfo(parsed.data, cookiesFile);
  if (!info.ok) {
    return Response.json({ error: info.error }, { status: 500 });
  }

  const items = buildStoryManifest(info.data);
  const manifest: StoryManifest = { items };
  return Response.json(manifest);
}

type StoryInfoResult =
  | { ok: true; data: RawYtDlpInfo }
  | { ok: false; error: string };

function fetchStoryInfo(
  url: string,
  cookiesFile: string,
): Promise<StoryInfoResult> {
  return new Promise((resolve) => {
    const child = spawn(YT_DLP_BIN, [
      "-J",
      "--quiet",
      "--no-warnings",
      "--cookies",
      cookiesFile,
      url,
    ]);

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    child.stdout?.on("data", (chunk: Buffer) => stdoutChunks.push(chunk));
    child.stderr?.on("data", (chunk: Buffer) => stderrChunks.push(chunk));

    child.on("error", (err) => resolve({ ok: false, error: err.message }));
    child.on("close", (code) => {
      if (code !== 0) {
        const stderrText = Buffer.concat(stderrChunks).toString().trim();
        resolve({
          ok: false,
          error: stderrText || `yt-dlp exited with code ${code}`,
        });
        return;
      }
      try {
        const parsed = JSON.parse(
          Buffer.concat(stdoutChunks).toString(),
        ) as RawYtDlpInfo;
        resolve({ ok: true, data: parsed });
      } catch {
        resolve({ ok: false, error: "Failed to parse yt-dlp output" });
      }
    });
  });
}

function buildStoryManifest(info: RawYtDlpInfo): StoryItem[] {
  const entries = info.entries ?? [];
  return entries.map((entry, index) => {
    const ext = entry.ext ?? "mp4";
    const filename = `story-${index + 1}.${ext}`;
    const type = ext === "mp4" || ext === "webm" ? "video" : "image";
    return {
      id: `story-${index + 1}`,
      filename,
      proxyUrl: `${PROXY_ENDPOINT}${encodeURIComponent(entry.url ?? "")}`,
      type,
      width: entry.width ?? 0,
      height: entry.height ?? 0,
      thumbnailUrl: entry.thumbnail ?? "",
    };
  });
}
