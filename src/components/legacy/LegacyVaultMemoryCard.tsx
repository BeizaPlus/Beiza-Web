import { useState } from "react";
import { Lock, Pause, Pencil, Play, Trash2 } from "lucide-react";
import type { LegacyRecording } from "@/lib/legacy/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const GOLD = "#E6A817";

type LegacyVaultMemoryCardProps = {
  recording: LegacyRecording;
  isPlaying: boolean;
  canDelete: boolean;
  onPlay: () => void;
  onRename: (title: string) => void;
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
  onRename,
  onDelete,
  onDeleteLocked,
}: LegacyVaultMemoryCardProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(recording.title ?? "");
  const locked = !canDelete;

  const commitRename = () => {
    setEditing(false);
    const next = draftTitle.trim();
    if (next !== (recording.title ?? "")) {
      onRename(next);
    }
  };

  return (
    <li className="relative flex items-start gap-3.5 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3.5">
      <button
        type="button"
        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-0"
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
        {editing ? (
          <Input
            autoFocus
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setDraftTitle(recording.title ?? "");
                setEditing(false);
              }
            }}
            placeholder="Memory title"
            className="h-8 border-[#333] bg-[#0a0a0a] text-sm text-white"
          />
        ) : (
          <button
            type="button"
            className="group flex max-w-full items-center gap-1.5 text-left"
            onClick={() => {
              setDraftTitle(recording.title ?? "");
              setEditing(true);
            }}
          >
            <p className="truncate text-sm font-semibold text-white">
              {recording.title || "Untitled memory"}
            </p>
            <Pencil className="h-3 w-3 shrink-0 text-[#555] group-hover:text-[#888]" aria-hidden />
            <span className="sr-only">Rename memory</span>
          </button>
        )}
        <p className="mt-0.5 truncate text-xs text-[#888]">{recording.prompt}</p>
        <p className="mt-1 text-[11px] text-[#555]">
          {formatDuration(recording.duration_seconds ?? 0)} · {formatDate(recording.created_at)}
        </p>
      </div>

      <button
        type="button"
        className={cn(
          "relative mt-0.5 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-[#333] bg-transparent transition-colors",
          !locked && "hover:border-[#E6A817]",
        )}
        onClick={() => {
          if (locked) onDeleteLocked?.();
          else onDelete?.();
        }}
        aria-label={locked ? "Delete locked — upgrade to remove" : "Delete memory"}
      >
        <Trash2
          className="h-4 w-4 transition-colors"
          style={{ color: locked ? "#444" : "#888" }}
          aria-hidden
        />
        {locked ? (
          <span
            className="absolute -right-1 -top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full"
            style={{ backgroundColor: GOLD }}
          >
            <Lock className="h-1.5 w-1.5 text-[#111]" aria-hidden />
          </span>
        ) : null}
      </button>
    </li>
  );
}
