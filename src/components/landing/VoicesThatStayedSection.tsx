import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useVoicesTestimonials, type VoiceCardData } from "@/hooks/useVoicesTestimonials";
import { carouselControlButton } from "@/lib/brandUi";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { cn } from "@/lib/utils";

const SCROLL_GAP_PX = 16;
const DESKTOP_SCROLL_STEP = 520;

function ChainMotif() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center" role="presentation" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center">
            {i > 0 ? <span className="h-px w-8 bg-border" /> : null}
            <span
              className={cn(
                "block h-2 w-2 shrink-0 rounded-full",
                i === 2 ? "border border-border bg-background" : "bg-primary",
              )}
              style={i !== 2 ? { boxShadow: "0 0 6px hsl(var(--primary) / 0.25)" } : undefined}
            />
          </div>
        ))}
      </div>
      <p className="text-eyebrow mt-3 text-center text-[0.65rem] tracking-[0.3em] text-muted-foreground">
        The chain doesn&apos;t break. It remembers.
      </p>
    </div>
  );
}

function VoiceCard({
  name,
  relation,
  location,
  country,
  featured,
  quote,
  imageUrl,
  tilt,
}: VoiceCardData & { tilt: number }) {
  return (
    <article
      className={cn(
        "flex h-[200px] w-[min(88vw,520px)] shrink-0 snap-start overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111111] shadow-[0_16px_48px_rgba(0,0,0,0.35)] transition-transform",
        featured && "border-l-[3px] border-l-[#E6A817]",
      )}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div className="relative h-full w-[42%] min-w-[140px] shrink-0 overflow-hidden bg-[#0a0a0a]">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover object-center" loading="lazy" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: "linear-gradient(145deg, #1a1200 0%, #0a0a0a 100%)" }}
          >
            <Quote className="h-8 w-8 text-[#E6A817]/30" aria-hidden />
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-[#111111]/90"
          aria-hidden
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
        <div>
          <Quote className="mb-2 h-4 w-4 text-[#E6A817]" aria-hidden />
          <p className="text-eyebrow text-[10px]">
            {relation}
            {location ? ` · ${location}` : ""}
          </p>
          <p className="mt-2 line-clamp-4 font-manrope text-sm leading-relaxed text-white/90">{quote}</p>
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e1800] text-[10px] font-semibold text-[#E6A817]">
            {name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{name}</p>
            <p className="truncate font-manrope text-[11px] text-[#555555]">{country}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function VoicesThatStayedSection({
  className,
  id = "cultural-films",
}: {
  className?: string;
  id?: string;
}) {
  const items = useVoicesTestimonials();
  const scrollRef = useDraggableScroll();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const getScrollStep = useCallback(() => {
    const track = scrollRef.current;
    if (!track) return DESKTOP_SCROLL_STEP;
    const card = track.querySelector<HTMLElement>("article");
    if (!card) return DESKTOP_SCROLL_STEP;
    return card.offsetWidth + SCROLL_GAP_PX;
  }, [scrollRef]);

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
  }, [updateScrollState, items.length]);

  const scrollByCard = (direction: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: direction * getScrollStep(), behavior: "smooth" });
  };

  return (
    <section
      id={id}
      className={cn("scroll-mt-24 border-t border-[#1a1a1a] bg-background text-foreground", className)}
      aria-label="Family testimonials"
    >
      <div className="mx-auto max-w-[1200px] px-6 pt-16 pb-16 md:px-12 md:pt-24 md:pb-20">
        <header className="mx-auto mb-12 max-w-[640px] text-center">
          <p className="text-eyebrow">Families preserving their legacy</p>
          <h2 className="text-display-lg mt-4 text-white">Their story didn&apos;t end there.</h2>
          <p className="mt-4 font-manrope text-base leading-relaxed text-[#666666]">
            Beiza is where families record, gather, and keep what matters — before and long after
            any goodbye.
          </p>
        </header>

        <div className="mb-6 flex gap-2">
          <button
            type="button"
            aria-label="Previous testimonial"
            disabled={!canScrollPrev}
            onClick={() => scrollByCard(-1)}
            className={carouselControlButton}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            disabled={!canScrollNext}
            onClick={() => scrollByCard(1)}
            className={carouselControlButton}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="relative overflow-hidden py-2">
          <div
            className="pointer-events-none absolute right-0 top-0 z-10 bottom-4 w-20 bg-gradient-to-l from-background via-background/80 to-transparent md:w-28"
            aria-hidden
          />
          <div
            ref={scrollRef}
            data-draggable
            className={cn(
              "flex items-center gap-5 overflow-x-auto overscroll-x-contain pb-4 pr-6 md:pr-12",
              "snap-x snap-mandatory scroll-smooth",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            )}
            style={{ WebkitOverflowScrolling: "touch" }}
            aria-label="Family testimonial cards"
          >
            {items.length === 0 ? (
              <p className="px-2 py-8 text-sm text-muted-foreground">
                Family voices will appear here once testimonials are published in Supabase.
              </p>
            ) : (
              items.map((item, index) => (
                <VoiceCard key={`${item.name}-${index}`} {...item} tilt={index % 2 === 0 ? -0.6 : 0.6} />
              ))
            )}
          </div>
        </div>

        <div className="mt-12">
          <ChainMotif />
        </div>
      </div>
    </section>
  );
}
