import {
  Clapperboard,
  History,
  Image,
  MonitorPlay,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InstagramMediaType } from "@/lib/validators";

type MediaType = {
  label: string;
  icon: typeof PlayCircle;
  value: InstagramMediaType;
  disabled?: boolean;
  disabledHint?: string;
};

const MEDIA_TYPES: readonly MediaType[] = [
  { label: "Video", icon: PlayCircle, value: InstagramMediaType.Video },
  { label: "Photo", icon: Image, value: InstagramMediaType.Photo },
  { label: "Reels", icon: Clapperboard, value: InstagramMediaType.Video },
  {
    label: "Story",
    icon: History,
    value: InstagramMediaType.Story,
    disabled: true,
    disabledHint: "Requires Instagram login — coming soon",
  },
  { label: "IGTV", icon: MonitorPlay, value: InstagramMediaType.Video },
] as const;

type MediaTypeChipsProps = {
  selected: InstagramMediaType;
  onSelect: (type: InstagramMediaType) => void;
};

export function MediaTypeChips({ selected, onSelect }: MediaTypeChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-sm mb-lg">
      {MEDIA_TYPES.map((type) => {
        const isActive = type.value === selected && !type.disabled;
        return (
          <button
            key={type.label}
            type="button"
            disabled={type.disabled}
            title={type.disabledHint}
            onClick={() => onSelect(type.value)}
            className={cn(
              "flex items-center gap-xs px-md py-xs rounded-full bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-variant transition-colors",
              isActive && "border-primary bg-primary/10 text-primary",
              type.disabled &&
                "opacity-50 cursor-not-allowed hover:bg-surface-container",
            )}
          >
            <type.icon className="size-[18px]" />
            <span className="text-label-sm font-semibold">{type.label}</span>
          </button>
        );
      })}
    </div>
  );
}
