import { Download, Loader2 } from "lucide-react";
import Image from "next/image";
import type { StoryManifestItem } from "@/shared/hooks/useStoryDownload";

type StoryManifestCardProps = {
  item: StoryManifestItem;
  isDownloading: boolean;
  onDownload: (item: StoryManifestItem) => void;
};

export function StoryManifestCard({
  item,
  isDownloading,
  onDownload,
}: StoryManifestCardProps) {
  return (
    <div className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden flex flex-col">
      <div className="relative w-full aspect-[9/16] bg-surface-variant">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.filename}
            fill
            className="object-cover"
            unoptimized
          />
        ) : null}
        <span className="absolute top-xs left-xs px-xs py-0.5 bg-black/60 text-white text-[10px] uppercase rounded">
          {item.type}
        </span>
      </div>
      <div className="p-sm flex flex-col gap-xs">
        <span className="text-label-sm text-on-surface-variant truncate">
          {item.width}×{item.height}
        </span>
        <button
          type="button"
          onClick={() => onDownload(item)}
          disabled={isDownloading}
          className="flex items-center justify-center gap-xs px-sm py-xs bg-primary-container text-white text-label-sm font-semibold rounded-md hover:bg-inverse-primary transition-colors disabled:opacity-50"
        >
          {isDownloading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {isDownloading ? "Downloading" : "Save"}
        </button>
      </div>
    </div>
  );
}
