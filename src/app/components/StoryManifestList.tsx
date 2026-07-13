import { Lock } from "lucide-react";
import type { StoryManifestItem } from "@/shared/hooks/useStoryDownload";
import { StoryManifestCard } from "./StoryManifestCard";

type StoryManifestListProps = {
  manifest: StoryManifestItem[] | null;
  needsAuth: boolean;
  needsAuthMessage: string;
  downloadingId: string | null;
  onDownloadOne: (item: StoryManifestItem) => void;
};

export function StoryManifestList({
  manifest,
  needsAuth,
  needsAuthMessage,
  downloadingId,
  onDownloadOne,
}: StoryManifestListProps) {
  if (needsAuth) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-surface-container border border-outline-variant rounded-xl p-lg flex items-center gap-md text-on-surface-variant">
        <Lock className="size-6 text-primary flex-shrink-0" />
        <p className="text-body-sm">{needsAuthMessage}</p>
      </div>
    );
  }

  if (!manifest?.length) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-md animate-in fade-in slide-in-from-top-4 duration-500">
      <h3 className="text-label-sm font-semibold text-on-surface uppercase tracking-widest">
        {manifest.length} story item{manifest.length > 1 ? "s" : ""} ready
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-sm">
        {manifest.map((item) => (
          <StoryManifestCard
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
