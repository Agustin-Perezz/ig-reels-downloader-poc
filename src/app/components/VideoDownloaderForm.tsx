"use client";

import { FormStatus, useReelDownload } from "@/shared/hooks/useReelDownload";
import { DownloadConfirmation } from "./DownloadConfirmation";
import { UrlInputBar } from "./UrlInputBar";

export function VideoDownloaderForm() {
  const {
    url,
    setUrl,
    state,
    handlePaste,
    handleFetch,
    handleDownload,
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
        submitLabel="Download"
      />

      {isReady && state.blob ? (
        <DownloadConfirmation
          filename={state.filename}
          fileSize={state.blob.size}
          isDownloading={isDownloading}
          onDownload={handleDownload}
          onCancel={handleCancel}
        />
      ) : null}
    </div>
  );
}
