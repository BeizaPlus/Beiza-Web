import { Lock, Pause, Play, Trash2 } from "lucide-react";
import type { LegacyRecording } from "@/lib/legacy/types";
import { cn } from "@/lib/utils";

const GOLD = "#E6A817";

type LegacyVaultMemoryCardProps = {
  recording: LegacyRecording;
  isPlaying: boolean;
  canDelete: boolean;
  onPlay: () => void;
  onDelete?: () => void;
  onDeleteLocked?: () => void;
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

export function LegacyVaultMemoryCard({
  recording,
  isPlaying,
  canDelete,
  onPlay,
  onDelete,
  onDeleteLocked,
}: LegacyVaultMemoryCardProps) {
  const locked = !canDelete;

  return (
    <li className="relative flex items-center gap-3.5 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3.5">
      <button
        type="button"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-0"
        style={{ backgroundColor: "#2e2200" }}
        onClick={onPlay}
        disabled={!recording.audio_url}
        aria-label={isPlaying ? "Pause memory" : "Play memory"}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" style={{ color: GOLD }} aria-hidden />
        ) : (
          <Play className="h-4 w-4 pl-0.5" style={{ color: GOLD }} aria-hidden />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{recording.title || "Untitled memory"}</p>
        <p className="mt-0.5 truncate text-xs text-[#888]">{recording.prompt}</p>
        <p className="mt-1 text-[11px] text-[#555]">
          {formatDuration(recording.duration_seconds ?? 0)} · {formatDate(recording.created_at)}
        </p>
      </div>

      <button
        type="button"
        className={cn(
          "relative flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-[#333] bg-transparent transition-colors",
          locked ? "cursor-pointer" : "cursor-pointer hover:border-[#555]",
        )}
        onClick={() => {
          if (locked) onDeleteLocked?.();
          else onDelete?.();
        }}
        aria-label={
          locked ? "Delete locked — upgrade to remove" : "Delete memory"
        }
        title={locked ? "Upgrade to delete memories" : "Delete memory"}
      >
        <Trash2
          className="h-4 w-4"
          style={{ color: locked ? "#444" : "#888" }}
          aria-hidden
        />
        {locked ? (
          <span
            className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full"
            style={{ backgroundColor: GOLD }}
          >
            <Lock className="h-2 w-2 text-[#111]" aria-hidden />
          </span>
        ) : null}
      </button>
    </li>
  );
}
