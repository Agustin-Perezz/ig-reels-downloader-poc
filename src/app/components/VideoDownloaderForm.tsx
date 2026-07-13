"use client";

import { FormStatus, useReelDownload } from "@/shared/hooks/useReelDownload";
import { UrlInputBar } from "./UrlInputBar";
import { VideoManifestList } from "./VideoManifestList";

export function VideoDownloaderForm() {
  const {
    url,
    setUrl,
    state,
    handlePaste,
    handleFetch,
    handleDownloadOne,
    handleDownloadAll,
    handleCancel,
  } = useReelDownload();

  const isFetching = state.status === FormStatus.Fetching;
  const isDownloading = state.status === FormStatus.Downloading;
  const isReady = state.status === FormStatus.Ready;
  const isBusy = isFetching || isDownloading;

  return (
    <div className="w-full flex flex-col gap-md">
      <UrlInputBar
        url={url}
        onUrlChange={setUrl}
        onSubmit={handleFetch}
        onPaste={handlePaste}
        isBusy={isBusy}
        errorMessage={state.errorMessage}
        isError={state.status === FormStatus.Error}
        placeholder="Insert instagram video or reel link here"
        submitLabel="Get video"
      />

      {state.manifest?.length ? (
        <VideoManifestList
          manifest={state.manifest}
          downloadingId={state.downloadingId}
          onDownloadOne={handleDownloadOne}
          onDownloadAll={handleDownloadAll}
        />
      ) : null}

      {isReady && !state.manifest?.length ? (
        <button
          type="button"
          onClick={handleCancel}
          className="self-center text-label-sm text-on-surface-variant underline"
        >
          Reset
        </button>
      ) : null}
    </div>
  );
}
