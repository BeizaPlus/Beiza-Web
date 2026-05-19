import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLegacyRecordings, useMyLegacyCircle } from "@/hooks/useLegacy";
import { Play, Pause } from "lucide-react";
import { useRef, useState } from "react";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LegacyVaultPage() {
  const { data: circleCtx } = useMyLegacyCircle();
  const circle = circleCtx?.circle;
  const { data: recordings = [], isLoading } = useLegacyRecordings(circle?.id);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

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
    <div className="space-y-6">
      <header>
        <h2 className="font-heading text-xl font-semibold">Your Family&apos;s Legacy Vault</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Listen back to preserved voices and stories.
        </p>
      </header>

      {isLoading && (
        <p className="text-center text-sm text-muted-foreground">Opening the vault…</p>
      )}

      {!isLoading && recordings.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">No memories yet.</p>
          <Button asChild className="mt-4">
            <Link to="/legacy/record">Record a memory</Link>
          </Button>
        </div>
      )}

      <ul className="space-y-3">
        {recordings.map((rec) => (
          <li
            key={rec.id}
            className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
          >
            <button
              type="button"
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
              onClick={() => togglePlay(rec.id, rec.audio_url)}
              disabled={!rec.audio_url}
              aria-label="Play memory"
            >
              {playingId === rec.id ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">
                {rec.title || "Untitled memory"}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{rec.prompt}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDuration(rec.duration_seconds ?? 0)} ·{" "}
                {new Date(rec.created_at).toLocaleDateString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
