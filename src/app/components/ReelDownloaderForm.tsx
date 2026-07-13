"use client";

import { ClipboardCheck, ClipboardPaste, Link2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

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
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-md">
      <form
        className="bg-surface-container border border-outline-variant rounded-xl p-xs flex flex-col sm:flex-row items-center gap-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-[0_4px_30px_rgba(79,70,229,0.1)]"
        onSubmit={handleFetch}
      >
        <div className="flex-1 w-full relative">
          <Link2 className="absolute left-sm top-1/2 -translate-y-1/2 size-5 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Insert instagram link here"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-invalid={state.status === FormStatus.Error}
            disabled={isBusy}
            className="w-full bg-transparent border-none text-on-surface text-body-md py-md pl-xl pr-sm focus:ring-0 focus:outline-none placeholder-on-surface-variant"
          />
        </div>
        <div className="flex gap-xs w-full sm:w-auto p-xs sm:p-0">
          <button
            type="button"
            onClick={onPasteClick}
            disabled={isBusy}
            className="flex-1 sm:flex-none flex items-center justify-center gap-xs px-md py-sm bg-surface-variant text-on-surface text-label-sm font-semibold rounded-lg hover:bg-surface-bright border border-outline-variant transition-colors"
          >
            {pasted ? (
              <ClipboardCheck className="size-[18px]" />
            ) : (
              <ClipboardPaste className="size-[18px]" />
            )}
            Paste
          </button>
          <button
            type="submit"
            disabled={isBusy || !url.trim()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-xs px-lg py-sm bg-primary-container text-white text-label-sm font-semibold rounded-lg hover:bg-inverse-primary transition-colors shadow-[0_4px_14px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? (
              <Loader2 className="size-[18px] animate-spin" />
            ) : null}
            {isFetching ? "Fetching..." : "Download"}
          </button>
        </div>
      </form>

      {state.status === FormStatus.Error && (
        <p
          className="text-sm text-error bg-error-container/20 px-md py-sm rounded-lg border border-error/30"
          role="alert"
        >
          {state.errorMessage}
        </p>
      )}

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
