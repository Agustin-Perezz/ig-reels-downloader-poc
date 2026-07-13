"use client";

import { useCallback, useState } from "react";

export enum FormStatus {
  Idle = "idle",
  Fetching = "fetching",
  Ready = "ready",
  Downloading = "downloading",
  Error = "error",
}

type FormState = {
  status: FormStatus;
  errorMessage: string;
  blob: Blob | null;
  filename: string;
};

const INITIAL_STATE: FormState = {
  status: FormStatus.Idle,
  errorMessage: "",
  blob: null,
  filename: "",
};

const DOWNLOAD_ENDPOINT = "/api/download";
const DEFAULT_FILENAME = `reel-${Date.now()}.mp4`;

type DownloadResponse = {
  error?: string;
};

export function useReelDownload() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<FormState>(INITIAL_STATE);

  const handlePaste = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return false;
    }
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        return true;
      }
    } catch {
      // Clipboard API not available or permission denied
    }
    return false;
  }, []);

  const handleFetch = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setState({ ...INITIAL_STATE, status: FormStatus.Fetching });

      try {
        const response = await fetch(DOWNLOAD_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          const data = (await response.json()) as DownloadResponse;
          setState({
            ...INITIAL_STATE,
            status: FormStatus.Error,
            errorMessage: data.error ?? "Fetch failed",
          });
          return;
        }

        const blob = await response.blob();
        const filename = extractFilename(response.headers) ?? DEFAULT_FILENAME;

        setState({
          status: FormStatus.Ready,
          errorMessage: "",
          blob,
          filename,
        });
      } catch (err) {
        setState({
          ...INITIAL_STATE,
          status: FormStatus.Error,
          errorMessage: err instanceof Error ? err.message : "Network error",
        });
      }
    },
    [url],
  );

  const handleDownload = useCallback(() => {
    if (!state.blob) {
      return;
    }

    setState((prev) => ({ ...prev, status: FormStatus.Downloading }));

    const objectUrl = URL.createObjectURL(state.blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = state.filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);

    setState(INITIAL_STATE);
    setUrl("");
  }, [state.blob, state.filename]);

  const handleCancel = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    url,
    setUrl,
    state,
    handlePaste,
    handleFetch,
    handleDownload,
    handleCancel,
  };
}

function extractFilename(headers: Headers): string | null {
  const disposition = headers.get("Content-Disposition") ?? "";
  const match = /filename="?([^"]+)"?/.exec(disposition);
  return match?.[1] ?? null;
}
