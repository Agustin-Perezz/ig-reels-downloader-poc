"use client";

import { useState } from "react";
import { InstagramMediaType } from "@/lib/validators";
import { MediaTypeChips } from "./MediaTypeChips";
import { PhotoDownloaderForm } from "./PhotoDownloaderForm";
import { StoryDownloaderForm } from "./StoryDownloaderForm";
import { VideoDownloaderForm } from "./VideoDownloaderForm";

export function MediaDownloader() {
  const [selectedType, setSelectedType] = useState<InstagramMediaType>(
    InstagramMediaType.Video,
  );

  return (
    <div className="w-full flex flex-col items-center gap-lg">
      <MediaTypeChips selected={selectedType} onSelect={setSelectedType} />
      {selectedType === InstagramMediaType.Video ? (
        <VideoDownloaderForm />
      ) : null}
      {selectedType === InstagramMediaType.Photo ? (
        <PhotoDownloaderForm />
      ) : null}
      {selectedType === InstagramMediaType.Story ? (
        <StoryDownloaderForm />
      ) : null}
    </div>
  );
}
