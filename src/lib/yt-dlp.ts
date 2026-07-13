import { type ChildProcess, spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import ZipStream from "zip-stream";

export type YtDlpStreamResult = {
  stream: ReadableStream<Uint8Array>;
};

export type YtDlpError = {
  message: string;
};

export type YtDlpResult =
  | { ok: true; data: YtDlpStreamResult }
  | { ok: false; error: YtDlpError };

const YT_DLP_BIN = "yt-dlp";
const YT_DLP_ARGS = ["-o", "-", "--quiet", "--no-warnings"] as const;

const NO_STDOUT_MESSAGE = "yt-dlp produced no stdout stream";

export type YtDlpEntry = {
  url: string;
  title?: string;
  ext?: string;
};

export type YtDlpMediaInfo = {
  isPlaylist: boolean;
  entryCount: number;
  entries: YtDlpEntry[];
};

export type YtDlpInfoResult =
  | { ok: true; data: YtDlpMediaInfo }
  | { ok: false; error: YtDlpError };

export type YtDlpZipResult = YtDlpStreamResult;

export type YtDlpZipResponse =
  | { ok: true; data: YtDlpZipResult }
  | { ok: false; error: YtDlpError };

export async function streamReel(url: string): Promise<YtDlpResult> {
  let child: ChildProcess;
  try {
    child = spawn(YT_DLP_BIN, [...YT_DLP_ARGS, url]);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to start yt-dlp";
    return { ok: false, error: { message } };
  }

  if (!child.stdout) {
    return { ok: false, error: { message: NO_STDOUT_MESSAGE } };
  }

  const stdout = child.stdout;
  const stderrChunks: Buffer[] = [];

  child.stderr?.on("data", (chunk: Buffer) => {
    stderrChunks.push(chunk);
  });

  const firstChunk = await waitForFirstDataOrError(child, stdout);

  if (!firstChunk.ok) {
    const stderrText = Buffer.concat(stderrChunks).toString().trim();
    const message = stderrText || firstChunk.error;
    return { ok: false, error: { message } };
  }

  const firstBuffer = firstChunk.data;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(firstBuffer));
      stdout.on("data", (chunk: Buffer) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      child.on("error", (err) => {
        controller.error(err);
      });
      child.on("close", (code) => {
        if (code === 0) {
          controller.close();
        } else {
          const stderrText = Buffer.concat(stderrChunks).toString().trim();
          controller.error(
            new Error(
              stderrText || `yt-dlp exited with code ${code ?? "null"}`,
            ),
          );
        }
      });
    },
    cancel() {
      child.kill("SIGTERM");
    },
  });

  return { ok: true, data: { stream } };
}

export async function fetchMediaInfo(url: string): Promise<YtDlpInfoResult> {
  let child: ChildProcess;
  try {
    child = spawn(YT_DLP_BIN, ["-J", "--quiet", "--no-warnings", url]);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to start yt-dlp";
    return { ok: false, error: { message } };
  }

  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];

  child.stdout?.on("data", (chunk: Buffer) => {
    stdoutChunks.push(chunk);
  });
  child.stderr?.on("data", (chunk: Buffer) => {
    stderrChunks.push(chunk);
  });

  const code = await new Promise<number | null>((resolve) => {
    child.on("close", resolve);
  });

  if (code !== 0) {
    const stderrText = Buffer.concat(stderrChunks).toString().trim();
    return {
      ok: false,
      error: { message: stderrText || `yt-dlp exited with code ${code}` },
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.concat(stdoutChunks).toString());
  } catch {
    return { ok: false, error: { message: "Failed to parse yt-dlp output" } };
  }

  return { ok: true, data: parseMediaInfo(parsed) };
}

type RawYtDlpInfo = {
  _type?: string;
  url?: string;
  title?: string;
  ext?: string;
  playlist_count?: number;
  entries?: RawYtDlpInfo[];
};

function parseMediaInfo(parsed: unknown): YtDlpMediaInfo {
  const data = parsed as RawYtDlpInfo;
  const isPlaylist = data._type === "playlist" || Array.isArray(data.entries);
  const entries = data.entries ?? [];
  return {
    isPlaylist,
    entryCount: isPlaylist ? entries.length : 1,
    entries: isPlaylist
      ? entries.map((e) => ({
          url: e.url ?? "",
          title: e.title,
          ext: e.ext,
        }))
      : [{ url: data.url ?? "", title: data.title, ext: data.ext }],
  };
}

export async function downloadAndZipVideos(
  url: string,
): Promise<YtDlpZipResponse> {
  const info = await fetchMediaInfo(url);
  if (!info.ok) {
    return info;
  }

  const entries = info.data.isPlaylist
    ? info.data.entries
    : [info.data.entries[0]];

  if (entries.length === 0 || !entries[0]?.url) {
    return { ok: false, error: { message: "No downloadable videos found" } };
  }

  const archive = new ZipStream();
  const webStream = Readable.toWeb(archive) as ReadableStream<Uint8Array>;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = webStream.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          controller.enqueue(value);
        }
      };
      pump().catch((err) => {
        controller.error(err instanceof Error ? err : new Error(String(err)));
      });

      let tempDir: string | null = null;
      try {
        tempDir = await mkdtemp(join(tmpdir(), "ig-dl-"));
        await downloadAllToDir(url, tempDir);
        const files = (await readdir(tempDir)).sort();
        for (const file of files) {
          await addFileToArchive(archive, join(tempDir, file), file);
        }
        await finalizeArchive(archive);
        controller.close();
      } catch (err) {
        controller.error(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (tempDir) {
          await rm(tempDir, { recursive: true, force: true }).catch(() => {});
        }
      }
    },
    cancel() {
      archive.destroy();
    },
  });

  return { ok: true, data: { stream } };
}

function downloadAllToDir(url: string, tempDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(YT_DLP_BIN, [
      "-o",
      `${tempDir}/%(playlist_index)s-%(id)s.%(ext)s`,
      "--quiet",
      "--no-warnings",
      url,
    ]);
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`yt-dlp exited with code ${code ?? "null"}`));
      }
    });
  });
}

function addFileToArchive(
  archive: ZipStream,
  filePath: string,
  name: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    archive.entry(createReadStream(filePath), { name }, (err: Error | null) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function finalizeArchive(archive: ZipStream): Promise<void> {
  return new Promise((resolve, reject) => {
    archive.on("end", resolve);
    archive.on("error", reject);
    archive.finalize();
  });
}

type FirstDataOrError =
  | { ok: true; data: Buffer }
  | { ok: false; error: string };

function waitForFirstDataOrError(
  child: ChildProcess,
  stdout: NodeJS.ReadableStream,
): Promise<FirstDataOrError> {
  return new Promise((resolve) => {
    let settled = false;

    const onStdoutData = (chunk: Buffer) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve({ ok: true, data: chunk });
    };

    const onClose = (code: number | null) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve({
        ok: false,
        error: `yt-dlp exited with code ${code ?? "null"}`,
      });
    };

    const onSpawnError = (err: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve({ ok: false, error: err.message });
    };

    function cleanup(): void {
      stdout.off("data", onStdoutData);
      child.off("close", onClose);
      child.off("error", onSpawnError);
    }

    stdout.on("data", onStdoutData);
    child.on("close", onClose);
    child.on("error", onSpawnError);
  });
}
