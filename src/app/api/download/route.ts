import { reelUrlSchema } from "@/lib/validators";
import { streamReel } from "@/lib/yt-dlp";

const VIDEO_CONTENT_TYPE = "video/mp4";

type DownloadBody = {
  url?: unknown;
};

export async function POST(request: Request): Promise<Response> {
  let body: DownloadBody;
  try {
    body = (await request.json()) as DownloadBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = reelUrlSchema.safeParse(body.url);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid URL" },
      { status: 400 },
    );
  }

  const result = await streamReel(parsed.data);
  if (!result.ok) {
    return Response.json({ error: result.error.message }, { status: 500 });
  }

  const filename = `reel-${Date.now()}.mp4`;

  return new Response(result.data.stream, {
    headers: {
      "Content-Type": VIDEO_CONTENT_TYPE,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
