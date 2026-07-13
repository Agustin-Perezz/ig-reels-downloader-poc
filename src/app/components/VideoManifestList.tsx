import { Download } from "lucide-react";
import type { VideoManifestItem } from "@/shared/hooks/useReelDownload";
import { VideoManifestCard } from "./VideoManifestCard";

type VideoManifestListProps = {
  manifest: VideoManifestItem[];
  downloadingId: string | null;
  onDownloadOne: (item: VideoManifestItem) => void;
  onDownloadAll: () => void;
};

export function VideoManifestList({
  manifest,
  downloadingId,
  onDownloadOne,
  onDownloadAll,
}: VideoManifestListProps) {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-md animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-label-sm font-semibold text-on-surface uppercase tracking-widest">
          {manifest.length} video{manifest.length > 1 ? "s" : ""} ready
        </h3>
        {manifest.length > 1 ? (
          <button
            type="button"
            onClick={onDownloadAll}
            disabled={Boolean(downloadingId)}
            className="flex items-center gap-xs px-md py-sm bg-primary-container text-white text-label-sm font-semibold rounded-lg hover:bg-inverse-primary transition-colors disabled:opacity-50"
          >
            <Download className="size-[18px]" />
            Download all
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-sm">
        {manifest.map((item) => (
          <VideoManifestCard
            key={item.id}
            item={item}
            isDownloading={downloadingId === item.id}
            onDownload={onDownloadOne}
          />
        ))}
      </div>
    </div>
  );
}
