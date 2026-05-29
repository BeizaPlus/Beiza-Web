import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegacyVaultPlusUpsell } from "@/components/legacy/LegacyVaultPlusUpsell";
import { LegacyVaultSequencePlayer } from "@/components/legacy/LegacyVaultSequencePlayer";
import { LegacyVaultMemoryCard } from "@/components/legacy/LegacyVaultMemoryCard";
import { LegacyKeeperUpsellDialog } from "@/components/legacy/LegacyKeeperUpsellDialog";
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
import { sortRecordingsForNarrative } from "@/lib/legacy/vaultNarrative";
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
import sampleFamiliesLegacyVault from "../../../sample-families-documenting-their-legacies.png";

function VaultAside() {
  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <figure className="mx-auto w-full max-w-sm lg:max-w-none">
        <img
          src={sampleFamiliesLegacyVault}
          alt="Legacy Vault heirloom book — families documenting their legacies"
          className="mx-auto h-auto w-full max-h-[min(52vh,440px)] object-contain object-center lg:max-h-[min(58vh,480px)]"
          loading="lazy"
          decoding="async"
        />
      </figure>
      <header className="mt-4 max-w-sm lg:mt-5">
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-[1.35rem]">
          Your Family&apos;s Legacy Vault
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#888888]">
          Listen back to preserved voices and stories Keeper.
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[#888888]">
          1. Share any memory free — download on.
        </p>
      </header>
    </aside>
  );
}

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

  const storyList = useMemo(() => sortRecordingsForNarrative(recordings), [recordings]);
  const narrativeSequence = storyList;

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

  const vaultStoriesPanel = (
    <div className="flex min-h-0 flex-1 flex-col lg:max-h-[calc(100dvh-10.5rem)]">
      {!circle ? (
        <div className="space-y-4 py-4 lg:py-2">
          <p className="text-sm text-[#888888]">
            Sign in and join a Legacy Circle to open your vault and hear preserved voices.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="default">
              <Link to={BEIZA_LINKS.legacy.family}>Your Legacy Circle</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={BEIZA_LINKS.legacy.recordStation}>Record a memory</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {circle && isLoading && <p className="text-sm text-[#888888]">Opening the vault…</p>}

      {circle && !isLoading && recordings.length === 0 && (
        <div className="py-8">
          <p className="text-[#888888]">No memories yet.</p>
          <Button asChild className="mt-4">
            <Link to={BEIZA_LINKS.legacy.recordStation}>Record a memory</Link>
          </Button>
        </div>
      )}

      {circle && !isLoading && recordings.length > 0 && (
        <>
          <div className="shrink-0">
            <LegacyVaultSequencePlayer
              sequence={narrativeSequence}
              activeId={playingId}
              onActiveChange={setPlayingId}
            />
          </div>

          <div className="mt-5 flex shrink-0 items-center justify-between gap-2 px-0.5">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#888888]">
              Open stories
              <span className="ml-2 font-normal text-[#666666]">({storyList.length})</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[#666666]" aria-hidden />
          </div>

          <div className="vault-recordings-scroll mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
            <ul className="space-y-3 pb-4">
              {storyList.map((rec) => (
                <LegacyVaultMemoryCard
                  key={rec.id}
                  recording={rec}
                  isPlaying={playingId === rec.id}
                  canDelete={canDelete}
                  canDownload={canDownload}
                  variant="vault"
                  onPlay={() => togglePlay(rec)}
                  onRename={(title) => handleRename(rec.id, title)}
                  onShare={() => void handleShare(rec)}
                  onDownload={() => handleDownload(rec)}
                  onDownloadLocked={() => openKeeperUpsell("download")}
                  onDelete={() => setPendingDeleteId(rec.id)}
                  onDeleteLocked={() => openKeeperUpsell("delete")}
                />
              ))}
            </ul>
            {!canDelete ? (
              <div className="pb-2">
                <LegacyVaultPlusUpsell />
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="vault-page-shell flex min-h-0 flex-col lg:h-[calc(100dvh-10.5rem)] lg:overflow-hidden">
      <div className="grid min-h-0 flex-1 items-start gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-10 xl:gap-12">
        <VaultAside />
        {vaultStoriesPanel}
      </div>

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
