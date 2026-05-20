import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { carouselControlButton } from "@/lib/brandUi";
import {
  resolveTimelineEntryImage,
  type GalleryImagePoolItem,
} from "@/lib/memoir/timelineImages";
import { cn } from "@/lib/utils";
import type { MemoirTimelineEntry } from "@/types/memoir";

const CARD_WIDTH = 280;
const SCROLL_GAP = 20;

type MemoirJourneyProps = {
  entries: MemoirTimelineEntry[];
  isLoading?: boolean;
  galleryPool?: GalleryImagePoolItem[];
};

function formatChapterDate(value: string) {
  try {
    return format(new Date(value), "MMM yyyy");
  } catch {
    return "";
  }
}

function JourneyCard({
  entry,
  image,
}: {
  entry: MemoirTimelineEntry;
  image: ReturnType<typeof resolveTimelineEntryImage>;
}) {
  const dateLabel = formatChapterDate(entry.timestamp);

  return (
    <article
      className="group relative w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-glass"
      style={{ aspectRatio: "3 / 4" }}
    >
      {image.src ? (
        <img
          src={image.src}
          alt={image.alt}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#111111] to-[#0a0a0a]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />

      {image.isGalleryPlaceholder ? (
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
          Gallery
        </span>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 space-y-2 p-5">
        {entry.eraLabel ? (
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#E6A817]">
            {entry.eraLabel}
          </p>
        ) : null}
        <h3 className="text-xl font-semibold leading-tight text-white">{entry.title}</h3>
        {dateLabel ? <p className="text-xs text-white/60">{dateLabel}</p> : null}
        {entry.location ? (
          <p className="line-clamp-1 text-[11px] text-white/50">{entry.location}</p>
        ) : null}
      </div>
    </article>
  );
}

const JourneyLoading = () => (
  <div className="flex gap-5 overflow-hidden px-[5%]">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="h-[373px] w-[280px] shrink-0 animate-pulse rounded-2xl bg-white/5"
      />
    ))}
  </div>
);

const JourneyEmpty = () => (
  <div className="rounded-lg border border-white/10 bg-white/5 p-12 text-center text-white/70">
    <h3 className="text-2xl font-semibold text-white">Journey coming soon</h3>
    <p className="mt-3 text-sm leading-relaxed text-white/70">
      Life chapters are being curated. Check back for a visual sweep through her story.
    </p>
  </div>
);

export function MemoirJourney({ entries, isLoading, galleryPool = [] }: MemoirJourneyProps) {
  const scrollRef = useDraggableScroll();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const resolved = useMemo(
    () =>
      entries.map((entry, index) => ({
        entry,
        image: resolveTimelineEntryImage(entry, index, galleryPool),
      })),
    [entries, galleryPool],
  );

  const updateScrollState = useCallback(() => {
    const track = scrollRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollPrev(track.scrollLeft > 2);
    setCanScrollNext(track.scrollLeft < maxScroll - 2);
  }, [scrollRef]);

  useEffect(() => {
    const track = scrollRef.current;
    if (!track) return;
    updateScrollState();
    track.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [resolved.length, updateScrollState, scrollRef]);

  const scrollBy = (direction: "prev" | "next") => {
    const track = scrollRef.current;
    if (!track) return;
    const delta = (CARD_WIDTH + SCROLL_GAP) * (direction === "next" ? 1 : -1);
    track.scrollBy({ left: delta, behavior: "smooth" });
  };

  if (isLoading) return <JourneyLoading />;
  if (!entries.length) return <JourneyEmpty />;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />

      <div
        ref={scrollRef}
        data-draggable
        className={cn(
          "flex gap-5 overflow-x-auto px-[5%] pb-2 snap-x snap-mandatory",
          "scrollbar-none cursor-grab active:cursor-grabbing",
        )}
        style={{ scrollbarWidth: "none" }}
      >
        {resolved.map(({ entry, image }) => (
          <JourneyCard key={entry.id} entry={entry} image={image} />
        ))}
      </div>

      {entries.length > 2 ? (
        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            className={carouselControlButton}
            onClick={() => scrollBy("prev")}
            disabled={!canScrollPrev}
            aria-label="Scroll journey backward"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className={carouselControlButton}
            onClick={() => scrollBy("next")}
            disabled={!canScrollNext}
            aria-label="Scroll journey forward"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
