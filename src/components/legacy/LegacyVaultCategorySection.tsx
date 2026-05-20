import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LegacyVaultMemoryCard } from "@/components/legacy/LegacyVaultMemoryCard";
import type { VaultCategoryGroup } from "@/lib/legacy/vaultNarrative";
import type { LegacyRecording } from "@/lib/legacy/types";
import { cn } from "@/lib/utils";

type LegacyVaultCategorySectionProps = {
  group: VaultCategoryGroup;
  defaultOpen?: boolean;
  playingId: string | null;
  canDelete: boolean;
  canDownload: boolean;
  onPlay: (rec: LegacyRecording) => void;
  onRename: (id: string, title: string) => void;
  onShare: (rec: LegacyRecording) => void;
  onDownload: (rec: LegacyRecording) => void;
  onDownloadLocked: () => void;
  onDelete: (id: string) => void;
  onDeleteLocked: () => void;
};

export function LegacyVaultCategorySection({
  group,
  defaultOpen = true,
  playingId,
  canDelete,
  canDownload,
  onPlay,
  onRename,
  onShare,
  onDownload,
  onDownloadLocked,
  onDelete,
  onDeleteLocked,
}: LegacyVaultCategorySectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="space-y-2">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1.5 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#888]">
          {group.label}
          <span className="ml-2 font-normal text-muted-foreground">({group.recordings.length})</span>
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? (
        <ul className="space-y-3">
          {group.recordings.map((rec) => (
            <LegacyVaultMemoryCard
              key={rec.id}
              recording={rec}
              isPlaying={playingId === rec.id}
              canDelete={canDelete}
              canDownload={canDownload}
              onPlay={() => onPlay(rec)}
              onRename={(title) => onRename(rec.id, title)}
              onShare={() => onShare(rec)}
              onDownload={() => onDownload(rec)}
              onDownloadLocked={onDownloadLocked}
              onDelete={() => onDelete(rec.id)}
              onDeleteLocked={onDeleteLocked}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
