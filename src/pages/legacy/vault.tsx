import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LegacyVaultMemoryCard } from "@/components/legacy/LegacyVaultMemoryCard";
import { LegacyVaultPlusUpsell } from "@/components/legacy/LegacyVaultPlusUpsell";
import { useLegacyRecordings, useMyLegacyCircle } from "@/hooks/useLegacy";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

/** When true, vault delete/rename is enabled (Legacy Plus). */
const LEGACY_PLUS_ENABLED = import.meta.env.VITE_LEGACY_PLUS_ENABLED === "true";

export default function LegacyVaultPage() {
  const { toast } = useToast();
  const { data: circleCtx } = useMyLegacyCircle();
  const circle = circleCtx?.circle;
  const { data: recordings = [], isLoading } = useLegacyRecordings(circle?.id);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const canManageVault = LEGACY_PLUS_ENABLED;

  const togglePlay = (id: string, url: string | null) => {
    if (!url) return;
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setPlayingId(null);
    void audio.play();
    setPlayingId(id);
  };

  const handleDeleteLocked = () => {
    toast({
      title: "Legacy Plus required",
      description: "Upgrade to delete and organize memories in your vault.",
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
                canDelete={canManageVault}
                onPlay={() => togglePlay(rec.id, rec.audio_url)}
                onDeleteLocked={handleDeleteLocked}
              />
            ))}
          </ul>
          {!canManageVault ? <LegacyVaultPlusUpsell /> : null}
        </>
      )}
    </div>
  );
}
