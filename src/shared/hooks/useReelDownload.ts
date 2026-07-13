"use client";

import { useCallback, useState } from "react";
import {
  DEFAULT_FILENAME,
  DOWNLOAD_ENDPOINT,
  type DownloadResponse,
  extractFilename,
  FormStatus,
  INITIAL_FORM_STATE,
} from "./download-types";

export { FormStatus };

export function useReelDownload() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState(INITIAL_FORM_STATE);

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
      setState({ ...INITIAL_FORM_STATE, status: FormStatus.Fetching });

      try {
        const response = await fetch(DOWNLOAD_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          const data = (await response.json()) as DownloadResponse;
          setState({
            ...INITIAL_FORM_STATE,
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
          ...INITIAL_FORM_STATE,
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

    setState(INITIAL_FORM_STATE);
    setUrl("");
  }, [state.blob, state.filename]);

  const handleCancel = useCallback(() => {
    setState(INITIAL_FORM_STATE);
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
