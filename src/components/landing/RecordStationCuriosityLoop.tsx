import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { MEDIA_ASSETS } from "@/lib/mediaAssets";
import { cn } from "@/lib/utils";

const FRAMES = [
  MEDIA_ASSETS.record.ghanaMarmah,
  MEDIA_ASSETS.record.studioLandscape,
] as const;

const CYCLE_MS = 5200;

type RecordStationCuriosityLoopProps = {
  className?: string;
};

/** Slow crossfade + Ken Burns — recording station & family imagery. */
export function RecordStationCuriosityLoop({ className }: RecordStationCuriosityLoopProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % FRAMES.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, []);

  const frame = FRAMES[index];

  return (
    <Link
      to={BEIZA_LINKS.legacy.recordStation}
      className={cn(
        "group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-black sm:aspect-[16/10]",
        className,
      )}
      aria-label="Open the recording station"
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={frame.src}
          src={frame.src}
          alt={frame.alt}
          className="absolute inset-0 h-full w-full object-cover object-[center_38%]"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1.1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.12, 0.23, 0.5, 1] }}
        />
      </AnimatePresence>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
        aria-hidden
      />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <p className="font-manrope text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E6A817]">
            Recording station
          </p>
          <p className="mt-1 font-manrope text-sm font-medium text-white sm:text-base">
            Hear your family&apos;s voice — record at the station
          </p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-sm transition group-hover:border-[#E6A817]/60 group-hover:bg-[#E6A817]/15">
          <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>

      <div className="absolute right-4 top-4 flex gap-1.5" aria-hidden>
        {FRAMES.map((item, i) => (
          <span
            key={item.src}
            className={cn(
              "h-1 w-1 rounded-full transition-all",
              i === index ? "w-4 bg-[#E6A817]" : "bg-white/35",
            )}
          />
        ))}
      </div>
    </Link>
  );
}
