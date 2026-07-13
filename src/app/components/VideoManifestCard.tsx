import { Download, Loader2, PlayCircle } from "lucide-react";
import Image from "next/image";
import type { VideoManifestItem } from "@/shared/hooks/useReelDownload";

type VideoManifestCardProps = {
  item: VideoManifestItem;
  isDownloading: boolean;
  onDownload: (item: VideoManifestItem) => void;
};

export function VideoManifestCard({
  item,
  isDownloading,
  onDownload,
}: VideoManifestCardProps) {
  return (
    <div className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden flex flex-col">
      <div className="relative w-full aspect-square bg-surface-variant">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.filename}
            fill
            className="object-cover"
            unoptimized
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <PlayCircle className="size-10 text-white/90" />
        </div>
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
