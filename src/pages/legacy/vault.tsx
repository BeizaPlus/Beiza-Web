import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LegacyVaultMemoryCard } from "@/components/legacy/LegacyVaultMemoryCard";
import { LegacyVaultPlusUpsell } from "@/components/legacy/LegacyVaultPlusUpsell";
import { LegacyKeeperUpsellDialog } from "@/components/legacy/LegacyKeeperUpsellDialog";
import {
  useDeleteLegacyRecording,
  useLegacyRecordings,
  useMyLegacyCircle,
  useUpdateLegacyRecordingTitle,
} from "@/hooks/useLegacy";
import { canDeleteVaultMemories, getLegacyTier } from "@/lib/legacy/tier";
import { useRef } from "react";
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
  const tier = getLegacyTier();
  const canDelete = canDeleteVaultMemories(tier);
  const { data: circleCtx } = useMyLegacyCircle();
  const circle = circleCtx?.circle;
  const { data: recordings = [], isLoading } = useLegacyRecordings(circle?.id);
  const updateTitle = useUpdateLegacyRecordingTitle();
  const deleteRecording = useDeleteLegacyRecording();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [keeperUpsellOpen, setKeeperUpsellOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const togglePlay = (id: string, url: string | null) => {
    if (!url) return;
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setPlayingId(null);
    void audio.play();
    setPlayingId(id);
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

  if (!circle) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">Your vault opens once you join a Legacy Circle.</p>
        <Button asChild>
          <Link to="/legacy/family">Your Legacy Circle</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-bold text-white">Your Family&apos;s Legacy Vault</h2>
        <p className="mt-1 text-[13px] text-[#888]">Listen back to preserved voices and stories.</p>
      </header>

      {isLoading && (
        <p className="text-center text-sm text-muted-foreground">Opening the vault…</p>
      )}

      {!isLoading && recordings.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
          <p className="text-[#888]">No memories yet.</p>
          <Button asChild className="mt-4">
            <Link to="/legacy/record">Record a memory</Link>
          </Button>
        </div>
      )}

      {!isLoading && recordings.length > 0 && (
        <>
          <ul className="space-y-3">
            {recordings.map((rec) => (
              <LegacyVaultMemoryCard
                key={rec.id}
                recording={rec}
                isPlaying={playingId === rec.id}
                canDelete={canDelete}
                onPlay={() => togglePlay(rec.id, rec.audio_url)}
                onRename={(title) => handleRename(rec.id, title)}
                onDelete={() => setPendingDeleteId(rec.id)}
                onDeleteLocked={() => setKeeperUpsellOpen(true)}
              />
            ))}
          </ul>
          {!canDelete ? <LegacyVaultPlusUpsell /> : null}
        </>
      )}

      <LegacyKeeperUpsellDialog open={keeperUpsellOpen} onOpenChange={setKeeperUpsellOpen} />

      <Dialog open={Boolean(pendingDeleteId)} onOpenChange={(o) => !o && setPendingDeleteId(null)}>
        <DialogContent className="border-[#1e1e1e] bg-[#111] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this memory?</DialogTitle>
            <DialogDescription className="text-[#888]">
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
