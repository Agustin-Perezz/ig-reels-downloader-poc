"use client";

import { useCallback, useState } from "react";
import { FormStatus } from "./download-types";

export { FormStatus };

export type StoryManifestItem = {
  id: string;
  filename: string;
  proxyUrl: string;
  type: "video" | "image";
  width: number;
  height: number;
  thumbnailUrl: string;
};

type StoryState = {
  status: FormStatus;
  errorMessage: string;
  manifest: StoryManifestItem[] | null;
  needsAuth: boolean;
  downloadingId: string | null;
};

const INITIAL_STATE: StoryState = {
  status: FormStatus.Idle,
  errorMessage: "",
  manifest: null,
  needsAuth: false,
  downloadingId: null,
};

const DOWNLOAD_ENDPOINT = "/api/download-story";
const NEEDS_AUTH_MESSAGE =
  "Instagram login is required to download stories. Coming soon.";

type StoryManifestResponse = {
  items: StoryManifestItem[];
};

type ErrorResponse = {
  error?: string;
  needsAuth?: boolean;
};

export function useStoryDownload() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<StoryState>(INITIAL_STATE);

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
          const data = (await response.json()) as ErrorResponse;
          setState({
            ...INITIAL_STATE,
            status: FormStatus.Error,
            errorMessage: data.error ?? "Fetch failed",
            needsAuth: data.needsAuth ?? false,
          });
          return;
        }

        const data = (await response.json()) as StoryManifestResponse;
        setState({
          status: FormStatus.Ready,
          errorMessage: "",
          manifest: data.items,
          needsAuth: false,
          downloadingId: null,
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

  const saveBlob = useCallback((blob: Blob, filename: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }, []);

  const handleDownloadOne = useCallback(
    async (item: StoryManifestItem) => {
      setState((prev) => ({
        ...prev,
        downloadingId: item.id,
        status: FormStatus.Downloading,
      }));
      try {
        const response = await fetch(item.proxyUrl);
        if (!response.ok) {
          throw new Error(`Download failed (status ${response.status})`);
        }
        const blob = await response.blob();
        saveBlob(blob, item.filename);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          status: FormStatus.Error,
          errorMessage: err instanceof Error ? err.message : "Download failed",
        }));
        return;
      }
      setState((prev) => ({
        ...prev,
        downloadingId: null,
        status: prev.manifest ? FormStatus.Ready : FormStatus.Idle,
      }));
    },
    [saveBlob],
  );

  const handleCancel = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    url,
    setUrl,
    state,
    needsAuthMessage: NEEDS_AUTH_MESSAGE,
    handlePaste,
    handleFetch,
    handleDownloadOne,
    handleCancel,
  };
}
