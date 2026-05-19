import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const GOLD = "#F5A623";
const TRACK = "#2a2a2a";

type LegacyPlaybackRowProps = {
  recordedUri: string;
  durationSeconds: number;
  className?: string;
};

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Inline playback: play/pause, scrubber, elapsed / total — no card border. */
export function LegacyPlaybackRow({ recordedUri, durationSeconds, className }: LegacyPlaybackRowProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [total, setTotal] = useState(durationSeconds);

  useEffect(() => {
    setPlaying(false);
    setElapsed(0);
    setTotal(durationSeconds);
  }, [recordedUri, durationSeconds]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const seekToRatio = (ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    const next = Math.max(0, Math.min(1, ratio)) * audio.duration;
    audio.currentTime = next;
    setElapsed(next);
  };

  const progress = total > 0 ? Math.min(1, elapsed / total) : 0;

  return (
    <div
      className={cn("flex w-full items-center gap-3 bg-transparent", className)}
      aria-label="Recording playback"
    >
      <audio
        ref={audioRef}
        src={recordedUri}
        className="sr-only"
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (audio?.duration && Number.isFinite(audio.duration)) {
            setTotal(Math.round(audio.duration));
          }
        }}
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (!audio) return;
          setElapsed(audio.currentTime);
          if (audio.duration && Number.isFinite(audio.duration)) {
            setTotal(Math.round(audio.duration));
          }
        }}
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-black"
        style={{ backgroundColor: GOLD }}
        onClick={() => void togglePlayback()}
        aria-pressed={playing}
        aria-label={playing ? "Pause recording" : "Play recording"}
      >
        {playing ? (
          <Pause className="h-5 w-5 fill-current" aria-hidden />
        ) : (
          <Play className="h-5 w-5 fill-current pl-0.5" aria-hidden />
        )}
      </button>
      <span className="w-9 shrink-0 text-xs tabular-nums text-muted-foreground">{formatTime(elapsed)}</span>
      <div
        ref={trackRef}
        className="relative h-1 flex-1 cursor-pointer rounded-full"
        style={{ backgroundColor: TRACK }}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={Math.round(elapsed)}
        aria-label="Playback position"
        onClick={(e) => {
          const rect = trackRef.current?.getBoundingClientRect();
          if (!rect?.width) return;
          seekToRatio((e.clientX - rect.left) / rect.width);
        }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${progress * 100}%`, backgroundColor: GOLD }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {formatTime(total)}
      </span>
    </div>
  );
}
