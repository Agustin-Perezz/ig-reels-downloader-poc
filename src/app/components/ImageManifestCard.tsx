import { Download, Loader2 } from "lucide-react";
import Image from "next/image";
import type { ImageManifestItem } from "@/shared/hooks/useImageDownload";

type ImageManifestCardProps = {
  item: ImageManifestItem;
  isDownloading: boolean;
  onDownload: (item: ImageManifestItem) => void;
};

export function ImageManifestCard({
  item,
  isDownloading,
  onDownload,
}: ImageManifestCardProps) {
  return (
    <div className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden flex flex-col">
      <div className="relative w-full aspect-square bg-surface-variant">
        <Image
          src={item.thumbnailUrl}
          alt={item.filename}
          fill
          className="object-cover"
          unoptimized
        />
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
