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

export type DownloadResponse = {
  error?: string;
};
