import { type ChildProcess, spawn } from "node:child_process";

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
