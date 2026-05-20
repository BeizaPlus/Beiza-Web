import { useEffect, useRef, useState } from "react";
import { ListMusic, Pause, Play, SkipForward } from "lucide-react";
import type { LegacyRecording } from "@/lib/legacy/types";
import { cn } from "@/lib/utils";

type LegacyVaultSequencePlayerProps = {
  sequence: LegacyRecording[];
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
};

export function LegacyVaultSequencePlayer({
  sequence,
  activeId,
  onActiveChange,
}: LegacyVaultSequencePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const playAt = (index: number) => {
    const rec = sequence[index];
    if (!rec?.audio_url) {
      if (index + 1 < sequence.length) playAt(index + 1);
      return;
    }
    indexRef.current = index;
    onActiveChange(rec.id);
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(rec.audio_url);
    audioRef.current = audio;
    audio.onended = () => {
      if (index + 1 < sequence.length) playAt(index + 1);
      else {
        setPlaying(false);
        onActiveChange(null);
      }
    };
    audio.onerror = () => {
      if (index + 1 < sequence.length) playAt(index + 1);
    };
    void audio.play();
    setPlaying(true);
  };

  const startSequence = () => {
    if (sequence.length === 0) return;
    playAt(0);
  };

  const stopSequence = () => {
    audioRef.current?.pause();
    setPlaying(false);
    onActiveChange(null);
  };

  const skipNext = () => {
    const next = indexRef.current + 1;
    if (next >= sequence.length) {
      stopSequence();
      return;
    }
    playAt(next);
  };

  if (sequence.length < 2) return null;

  const activeIndex = activeId ? sequence.findIndex((r) => r.id === activeId) : -1;

  return (
    <div className="rounded-xl border border-[#E6A817]/30 bg-[#141008] px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
          <ListMusic className="h-4 w-4 text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Family story sequence</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Plays your vault in life-arc order — like a story editor stitched your family tree
            together.
          </p>
          {playing && activeIndex >= 0 ? (
            <p className="mt-1.5 truncate text-[11px] text-primary">
              Now playing {activeIndex + 1} of {sequence.length}:{" "}
              {sequence[activeIndex]?.title || "Untitled memory"}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={playing ? stopSequence : startSequence}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground"
        >
          {playing ? (
            <>
              <Pause className="h-3.5 w-3.5" aria-hidden />
              Stop sequence
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 pl-0.5" aria-hidden />
              Play full story
            </>
          )}
        </button>
        <button
          type="button"
          disabled={!playing}
          onClick={skipNext}
          className={cn(
            "inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-xs text-subtle",
            playing && "hover:border-primary",
          )}
          aria-label="Skip to next memory"
        >
          <SkipForward className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
