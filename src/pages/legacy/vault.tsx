import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LegacyVaultCategorySection } from "@/components/legacy/LegacyVaultCategorySection";
import { LegacyVaultPlusUpsell } from "@/components/legacy/LegacyVaultPlusUpsell";
import { LegacyVaultSequencePlayer } from "@/components/legacy/LegacyVaultSequencePlayer";
import { LegacyKeeperUpsellDialog } from "@/components/legacy/LegacyKeeperUpsellDialog";
import { LegacyFarewellNudge } from "@/components/legacy/LegacyFarewellNudge";
import {
  ensureRecordingShareToken,
  useDeleteLegacyRecording,
  useLegacyRecordings,
  useMyLegacyCircle,
  useUpdateLegacyRecordingTitle,
} from "@/hooks/useLegacy";
import { canDeleteVaultMemories, canDownloadRecordings } from "@/lib/legacy/tier";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { useLegacyEntitlement } from "@/hooks/useLegacyEntitlement";
import { getMemoryShareUrl } from "@/lib/legacy/shareUrl";
import {
  groupVaultRecordingsByCategory,
  sortRecordingsForNarrative,
} from "@/lib/legacy/vaultNarrative";
import type { LegacyRecording } from "@/lib/legacy/types";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LegacyVaultPage() {
  const { toast } = useToast();
  const { tier } = useLegacyEntitlement();
  const canDelete = canDeleteVaultMemories(tier);
  const canDownload = canDownloadRecordings(tier);
  const { data: circleCtx } = useMyLegacyCircle();
  const circle = circleCtx?.circle;
  const { data: recordings = [], isLoading } = useLegacyRecordings(circle?.id);
  const updateTitle = useUpdateLegacyRecordingTitle();
  const deleteRecording = useDeleteLegacyRecording();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [keeperUpsellOpen, setKeeperUpsellOpen] = useState(false);
  const [keeperUpsellReason, setKeeperUpsellReason] = useState<"delete" | "download">("delete");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);

  const narrativeSequence = useMemo(
    () => sortRecordingsForNarrative(recordings),
    [recordings],
  );
  const categoryGroups = useMemo(
    () => groupVaultRecordingsByCategory(recordings),
    [recordings],
  );

  const openKeeperUpsell = (reason: "delete" | "download") => {
    setKeeperUpsellReason(reason);
    setKeeperUpsellOpen(true);
  };

  const togglePlay = (rec: LegacyRecording) => {
    if (!rec.audio_url) return;
    if (playingId === rec.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(rec.audio_url);
    audioRef.current = audio;
    audio.onended = () => setPlayingId(null);
    void audio.play();
    setPlayingId(rec.id);
  };

  const handleRename = (id: string, title: string) => {
    updateTitle.mutate(
      { id, title },
      {
        onError: () => {
          toast({
            title: "Could not rename",
            description: "Try again in a moment.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleShare = async (rec: LegacyRecording) => {
    setSharingId(rec.id);
    try {
      const token = rec.share_token ?? (await ensureRecordingShareToken(rec.id));
      const url = getMemoryShareUrl(token);
      await navigator.clipboard.writeText(url);
      toast({
        title: "Share link copied",
        description: "Anyone with this link can listen in Beiza — not download the file.",
      });
    } catch {
      toast({
        title: "Could not create share link",
        description: "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSharingId(null);
    }
  };

  const handleDownload = (rec: LegacyRecording) => {
    if (!rec.audio_url) return;
    const anchor = document.createElement("a");
    anchor.href = rec.audio_url;
    anchor.download = `${(rec.title || "beiza-memory").replace(/\s+/g, "-")}.webm`;
    anchor.rel = "noopener";
    anchor.click();
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    deleteRecording.mutate(pendingDeleteId, {
      onSuccess: () => {
        setPendingDeleteId(null);
        toast({ title: "Memory removed from vault" });
      },
      onError: () => {
        toast({
          title: "Could not delete",
          description: "Try again or contact support.",
          variant: "destructive",
        });
      },
    });
  };

  const vaultHeader = (
    <header>
      <h2 className="text-xl font-bold text-white">Your Family&apos;s Legacy Vault</h2>
      <p className="mt-1 text-[13px] text-[#888]">
        Listen back to preserved voices and stories. Share any memory free — download on Keeper.
      </p>
      <figure className="mt-4 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#141414] p-3 sm:p-4">
        <img
          src="/images/beiza-legacy-vault-book.png"
          alt="Legacy Vault heirloom book — preserved family stories and voices"
          className="mx-auto h-auto max-h-[min(72vh,520px)] w-full object-contain"
          loading="lazy"
          decoding="async"
        />
      </figure>
    </header>
  );

  if (!circle) {
    return (
      <div className="space-y-5">
        {vaultHeader}
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-center sm:p-8">
          <p className="text-sm text-muted-foreground">
            Sign in and join a Legacy Circle to open your vault and hear preserved voices.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild variant="default">
              <Link to={BEIZA_LINKS.legacy.family}>Your Legacy Circle</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={BEIZA_LINKS.legacy.recordStation}>Record a memory</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {vaultHeader}

      {isLoading && (
        <p className="text-center text-sm text-muted-foreground">Opening the vault…</p>
      )}

      {!isLoading && recordings.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
          <p className="text-[#888]">No memories yet.</p>
          <Button asChild className="mt-4">
            <Link to={BEIZA_LINKS.legacy.recordStation}>Record a memory</Link>
          </Button>
        </div>
      )}

      {!isLoading && recordings.length > 0 && (
        <>
          <LegacyVaultSequencePlayer
            sequence={narrativeSequence}
            activeId={playingId}
            onActiveChange={setPlayingId}
          />

          <div className="space-y-6">
            {categoryGroups.map((group, i) => (
              <LegacyVaultCategorySection
                key={group.category}
                group={group}
                defaultOpen={i === 0}
                playingId={playingId}
                canDelete={canDelete}
                canDownload={canDownload}
                onPlay={togglePlay}
                onRename={handleRename}
                onShare={handleShare}
                onDownload={handleDownload}
                onDownloadLocked={() => openKeeperUpsell("download")}
                onDelete={setPendingDeleteId}
                onDeleteLocked={() => openKeeperUpsell("delete")}
              />
            ))}
          </div>

          {!canDelete ? <LegacyVaultPlusUpsell /> : null}

          <LegacyFarewellNudge className="pt-8" />
        </>
      )}

      <LegacyKeeperUpsellDialog
        open={keeperUpsellOpen}
        onOpenChange={setKeeperUpsellOpen}
        reason={keeperUpsellReason}
      />

      <Dialog open={Boolean(pendingDeleteId)} onOpenChange={(o) => !o && setPendingDeleteId(null)}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this memory?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This cannot be undone. The recording will be removed from your family vault.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPendingDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
