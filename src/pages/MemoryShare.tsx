import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Pause, Play } from "lucide-react";
import { BeizaCircleMark } from "@/components/family-trees/BeizaCircleMark";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { cn } from "@/lib/utils";

type SharedMemory = {
  id: string;
  prompt: string;
  audio_url: string;
  duration_seconds: number;
  title: string | null;
  circle_name: string;
};

export default function MemorySharePage() {
  const { token } = useParams<{ token: string }>();
  const [memory, setMemory] = useState<SharedMemory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid share link");
      setLoading(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/memory/public?token=${encodeURIComponent(token)}`);
        const body = (await res.json()) as SharedMemory & { error?: string };
        if (!res.ok) {
          if (!cancelled) setError(body.error ?? "Memory not found");
          return;
        }
        if (!cancelled) setMemory(body);
      } catch {
        if (!cancelled) setError("Could not load this memory");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      audioRef.current?.pause();
    };
  }, [token]);

  const togglePlay = () => {
    if (!memory?.audio_url) return;
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(memory.audio_url);
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    void audio.play();
    setPlaying(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      <header className="flex flex-col items-center gap-3 px-6 pt-12">
        <BeizaCircleMark size={48} className="rounded-sm" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E6A817]">
          Beiza Legacy
        </p>
        <p className="text-xs text-[#666]">Preserved on Beiza</p>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
        {loading ? (
          <p className="text-center text-sm text-[#888]">Opening memory…</p>
        ) : null}
        {error ? (
          <p className="text-center text-sm text-[#888]">{error}</p>
        ) : null}
        {memory ? (
          <div className="flex flex-col items-center gap-6 text-center">
            <button
              type="button"
              onClick={togglePlay}
              className={cn(
                "flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#E6A817] bg-[#141008] shadow-[0_0_40px_rgba(230,168,23,0.15)] transition-transform",
                playing && "scale-[0.98]",
              )}
              aria-label={playing ? "Pause" : "Play memory"}
            >
              {playing ? (
                <Pause className="h-10 w-10 text-[#E6A817]" aria-hidden />
              ) : (
                <Play className="h-10 w-10 pl-1 text-[#E6A817]" aria-hidden />
              )}
            </button>

            {memory.title ? (
              <p className="text-base font-semibold text-white">{memory.title}</p>
            ) : null}

            <p className="max-w-sm font-manrope text-sm italic leading-relaxed text-[#aaaaaa]">
              &ldquo;{memory.prompt}&rdquo;
            </p>

            <p className="text-xs text-[#666]">
              A memory from the <span className="text-[#ccc]">{memory.circle_name}</span> circle
            </p>
          </div>
        ) : null}
      </main>

      <footer className="px-6 pb-12 pt-4 text-center">
        <Link
          to={BEIZA_LINKS.welcome.gate}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#E6A817] hover:underline"
        >
          Preserve your family&apos;s voices — free →
        </Link>
      </footer>
    </div>
  );
}
