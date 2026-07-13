"use client";

import { FormStatus, useStoryDownload } from "@/shared/hooks/useStoryDownload";
import { StoryManifestList } from "./StoryManifestList";
import { UrlInputBar } from "./UrlInputBar";

export function StoryDownloaderForm() {
  const {
    url,
    setUrl,
    state,
    needsAuthMessage,
    handlePaste,
    handleFetch,
    handleDownloadOne,
    handleCancel,
  } = useStoryDownload();

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
        placeholder="Insert instagram story link here"
        submitLabel="Get story"
      />

      {(state.manifest?.length || state.needsAuth) && (
        <StoryManifestList
          manifest={state.manifest}
          needsAuth={state.needsAuth}
          needsAuthMessage={needsAuthMessage}
          downloadingId={state.downloadingId}
          onDownloadOne={handleDownloadOne}
        />
      )}

      {isReady && state.manifest?.length && !state.needsAuth ? (
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
