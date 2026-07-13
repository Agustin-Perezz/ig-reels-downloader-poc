"use client";

import { ClipboardCheck, ClipboardPaste, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FormStatus, useReelDownload } from "@/shared/hooks/useReelDownload";

import { ReelDownloaderConfirmation } from "./ReelDownloaderConfirmation";

const PASTE_ICON_DURATION_MS = 2000;

export function ReelDownloaderForm() {
  const {
    url,
    setUrl,
    state,
    handlePaste,
    handleFetch,
    handleDownload,
    handleCancel,
  } = useReelDownload();

  const [pasted, setPasted] = useState(false);

  useEffect(() => {
    if (!pasted) {
      return;
    }
    const timer = setTimeout(() => setPasted(false), PASTE_ICON_DURATION_MS);
    return () => clearTimeout(timer);
  }, [pasted]);

  async function onPasteClick() {
    const success = await handlePaste();
    if (success) {
      setPasted(true);
    }
  }

  const isFetching = state.status === FormStatus.Fetching;
  const isDownloading = state.status === FormStatus.Downloading;
  const isReady = state.status === FormStatus.Ready;
  const isBusy = isFetching || isDownloading;

  return (
    <div className="flex flex-col gap-4">
      <form className="flex flex-col gap-3" onSubmit={handleFetch}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reel-url">Instagram Reel URL</Label>
          <div className="flex gap-2">
            <Input
              id="reel-url"
              type="url"
              placeholder="https://www.instagram.com/reel/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              aria-invalid={state.status === FormStatus.Error}
              disabled={isBusy}
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={onPasteClick}
              disabled={isBusy}
              aria-label="Paste URL from clipboard"
            >
              {pasted ? <ClipboardCheck /> : <ClipboardPaste />}
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isBusy || !url.trim()}
          className="h-11 cursor-pointer"
        >
          {isFetching ? <Loader2 className="animate-spin" /> : <Search />}
          {isFetching ? "Fetching..." : "Fetch Reel"}
        </Button>

        {state.status === FormStatus.Error && (
          <p className="text-sm text-destructive" role="alert">
            {state.errorMessage}
          </p>
        )}
      </form>

      {isReady && state.blob && (
        <ReelDownloaderConfirmation
          filename={state.filename}
          fileSize={state.blob.size}
          isDownloading={isDownloading}
          onDownload={handleDownload}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
