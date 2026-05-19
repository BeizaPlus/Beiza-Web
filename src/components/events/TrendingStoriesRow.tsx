import { useCallback, useEffect, useState } from "react";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { carouselControlButton } from "@/lib/brandUi";
import type { EventStory } from "@/hooks/usePublicContent";
import { cn } from "@/lib/utils";

const CARD_WIDTH = 200;
const SCROLL_GAP = 16;

type TrendingStoriesRowProps = {
  stories: EventStory[];
  className?: string;
};

function storyHref(story: EventStory) {
  if (story.memoirSlug) return `/memoirs/${story.memoirSlug}`;
  return `/memoirs?story=${story.slug}`;
}

function TrendingStoryCard({ story }: { story: EventStory }) {
  const imageSrc = story.heroMedia?.src;
  const imageAlt = story.heroMedia?.alt ?? story.title;

  return (
    <Link
      to={storyHref(story)}
      className="group relative block w-[200px] shrink-0 snap-start overflow-hidden rounded-xl bg-[#111111]"
      style={{ aspectRatio: "2 / 3" }}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-[#1a1a1a]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {story.isNew ? (
        <span className="absolute left-3 top-3 rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
          New
        </span>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-lg font-semibold leading-tight text-white">{story.title}</h3>
        {story.subtitle ? (
          <p className="mt-2 line-clamp-3 text-[11px] leading-snug text-white/75">
            <span className="text-white/40">—</span> {story.subtitle}
          </p>
        ) : null}
        {story.durationLabel ? (
          <p className="mt-2 text-[11px] text-white/55">{story.durationLabel}</p>
        ) : null}
      </div>
    </Link>
  );
}

export function TrendingStoriesRow({ stories, className }: TrendingStoriesRowProps) {
  const scrollRef = useDraggableScroll();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const updateScrollState = useCallback(() => {
    const track = scrollRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollPrev(track.scrollLeft > 2);
    setCanScrollNext(track.scrollLeft < maxScroll - 2);
  }, []);

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
  }, [updateScrollState, stories.length]);

  const scrollBy = (direction: -1 | 1) => {
    scrollRef.current?.scrollBy({
      left: direction * (CARD_WIDTH + SCROLL_GAP),
      behavior: "smooth",
    });
  };

  if (stories.length === 0) return null;

  return (
    <section className={cn("relative", className)} aria-label="Trending stories">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white md:text-3xl">Trending</h2>
          <Link to="/memoirs" className="mt-1 inline-block text-sm text-white/50 hover:text-white">
            See all
          </Link>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous stories"
            disabled={!canScrollPrev}
            onClick={() => scrollBy(-1)}
            className={carouselControlButton}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next stories"
            disabled={!canScrollNext}
            onClick={() => scrollBy(1)}
            className={carouselControlButton}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          data-draggable
          className={cn(
            "flex gap-4 overflow-x-auto pb-4",
            "snap-x snap-mandatory scroll-smooth",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          )}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {stories.map((story) => (
            <TrendingStoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>
    </section>
  );
}
