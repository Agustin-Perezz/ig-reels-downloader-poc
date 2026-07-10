"use client";

import { useState } from "react";

export enum FormStatus {
  Idle = "idle",
  Downloading = "downloading",
  Error = "error",
}

type FormState = {
  status: FormStatus;
  errorMessage: string;
};

const INITIAL_STATE: FormState = {
  status: FormStatus.Idle,
  errorMessage: "",
};

const DOWNLOAD_ENDPOINT = "/api/download";

type DownloadResponse = {
  error?: string;
};

export function useReelDownload() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<FormState>(INITIAL_STATE);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: FormStatus.Downloading, errorMessage: "" });

    try {
      const response = await fetch(DOWNLOAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = (await response.json()) as DownloadResponse;
        setState({
          status: FormStatus.Error,
          errorMessage: data.error ?? "Download failed",
        });
        return;
      }

      const blob = await response.blob();
      triggerBrowserDownload(blob, response.headers);
      setState(INITIAL_STATE);
    } catch (err) {
      setState({
        status: FormStatus.Error,
        errorMessage: err instanceof Error ? err.message : "Network error",
      });
    }
  }

  return { url, setUrl, state, handleSubmit };
}

function triggerBrowserDownload(blob: Blob, headers: Headers): void {
  const disposition = headers.get("Content-Disposition") ?? "";
  const match = /filename="?([^"]+)"?/.exec(disposition);
  const filename = match?.[1] ?? `reel-${Date.now()}.mp4`;

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
