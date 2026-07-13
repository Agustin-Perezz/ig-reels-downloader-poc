export enum FormStatus {
  Idle = "idle",
  Fetching = "fetching",
  Ready = "ready",
  Downloading = "downloading",
  Error = "error",
}

export type FormState = {
  status: FormStatus;
  errorMessage: string;
  blob: Blob | null;
  filename: string;
};

export const INITIAL_FORM_STATE: FormState = {
  status: FormStatus.Idle,
  errorMessage: "",
  blob: null,
  filename: "",
};

export const DOWNLOAD_ENDPOINT = "/api/download";
export const DEFAULT_FILENAME = `instagram-${Date.now()}.mp4`;

export type DownloadResponse = {
  error?: string;
};

export function extractFilename(headers: Headers): string | null {
  const disposition = headers.get("Content-Disposition") ?? "";
  const match = /filename="?([^"]+)"?/.exec(disposition);
  return match?.[1] ?? null;
}
