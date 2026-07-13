import {
  Clapperboard,
  History,
  Image,
  MonitorPlay,
  PlayCircle,
} from "lucide-react";

type MediaType = {
  label: string;
  icon: typeof PlayCircle;
};

const MEDIA_TYPES: readonly MediaType[] = [
  { label: "Video", icon: PlayCircle },
  { label: "Photo", icon: Image },
  { label: "Reels", icon: Clapperboard },
  { label: "Story", icon: History },
  { label: "IGTV", icon: MonitorPlay },
] as const;

export function MediaTypeChips() {
  return (
    <div className="flex flex-wrap justify-center gap-sm mb-lg">
      {MEDIA_TYPES.map((type) => (
        <button
          key={type.label}
          type="button"
          className="flex items-center gap-xs px-md py-xs rounded-full bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-variant transition-colors"
        >
          <type.icon className="size-[18px]" />
          <span className="text-label-sm font-semibold">{type.label}</span>
        </button>
      ))}
    </div>
  );
}
