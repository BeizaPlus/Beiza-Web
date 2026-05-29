import { useState } from "react";
import { Download, Lock, Pause, Pencil, Play, Share2, Trash2 } from "lucide-react";
import type { LegacyRecording } from "@/lib/legacy/types";
import { legacySurface } from "@/lib/brandUi";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type LegacyVaultMemoryCardProps = {
  recording: LegacyRecording;
  isPlaying: boolean;
  canDelete: boolean;
  canDownload: boolean;
  onPlay: () => void;
  onRename: (title: string) => void;
  onShare: () => void;
  onDownload?: () => void;
  onDownloadLocked?: () => void;
  onDelete?: () => void;
  onDeleteLocked?: () => void;
  /** Vault page — dark cards on black (no grey card shell). */
  variant?: "default" | "vault";
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

function ActionButton({
  locked,
  label,
  onClick,
  onLocked,
  children,
}: {
  locked?: boolean;
  label: string;
  onClick?: () => void;
  onLocked?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-border bg-transparent transition-colors",
        !locked && "hover:border-primary",
      )}
      onClick={() => {
        if (locked) onLocked?.();
        else onClick?.();
      }}
      aria-label={label}
    >
      {children}
      {locked ? (
        <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary">
          <Lock className="h-1.5 w-1.5 text-primary-foreground" aria-hidden />
        </span>
      ) : null}
    </button>
  );
}

export function LegacyVaultMemoryCard({
  recording,
  isPlaying,
  canDelete,
  canDownload,
  onPlay,
  onRename,
  onShare,
  onDownload,
  onDownloadLocked,
  onDelete,
  onDeleteLocked,
  variant = "default",
}: LegacyVaultMemoryCardProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(recording.title ?? "");
  const deleteLocked = !canDelete;
  const downloadLocked = !canDownload;

  const commitRename = () => {
    setEditing(false);
    const next = draftTitle.trim();
    if (next !== (recording.title ?? "")) {
      onRename(next);
    }
  };

  return (
    <li
      className={cn(
        "relative flex items-start gap-3.5 overflow-hidden px-4 py-3.5",
        variant === "vault"
          ? "rounded-xl border border-[#1e1e1e] bg-[#0a0a0a]"
          : legacySurface,
      )}
      data-recording-id={recording.id}
    >
      <button
        type="button"
        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-0 bg-[#E6A817] disabled:opacity-50"
        onClick={onPlay}
        disabled={!recording.audio_url}
        aria-label={isPlaying ? "Pause memory" : "Play memory"}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 fill-[#0a0a0a] text-[#0a0a0a]" aria-hidden />
        ) : (
          <Play className="h-4 w-4 fill-[#0a0a0a] pl-0.5 text-[#0a0a0a]" aria-hidden />
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
            className="h-8 border-border bg-background text-sm text-foreground"
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
            <Pencil
              className="h-3 w-3 shrink-0 text-muted-foreground group-hover:text-subtle"
              aria-hidden
            />
            <span className="sr-only">Rename memory</span>
          </button>
        )}
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{recording.prompt}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {formatDuration(recording.duration_seconds ?? 0)} · {formatDate(recording.created_at)}
        </p>
      </div>

      <div className="mt-0.5 flex shrink-0 gap-1.5">
        <ActionButton label="Share memory link" onClick={onShare}>
          <Share2 className="h-4 w-4 text-[#E6A817]" aria-hidden />
        </ActionButton>
        <ActionButton
          locked={downloadLocked}
          label={downloadLocked ? "Download locked — upgrade to Keeper" : "Download audio file"}
          onClick={onDownload}
          onLocked={onDownloadLocked}
        >
          <Download
            className={cn(
              "h-4 w-4",
              downloadLocked ? "text-muted-foreground/60" : "text-muted-foreground",
            )}
            aria-hidden
          />
        </ActionButton>
        <ActionButton
          locked={deleteLocked}
          label={deleteLocked ? "Delete locked — upgrade to remove" : "Delete memory"}
          onClick={onDelete}
          onLocked={onDeleteLocked}
        >
          <Trash2
            className={cn(
              "h-4 w-4",
              deleteLocked ? "text-muted-foreground/60" : "text-muted-foreground",
            )}
            aria-hidden
          />
        </ActionButton>
      </div>
      {isPlaying ? (
        <span
          className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#E6A817]"
          aria-hidden
        />
      ) : null}
    </li>
  );
}
