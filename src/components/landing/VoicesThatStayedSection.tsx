import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { VOICES_TESTIMONIALS } from "@/lib/legacy/voicesTestimonials";
import { carouselControlButton } from "@/lib/brandUi";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { cn } from "@/lib/utils";

const SCROLL_GAP_PX = 16;
const DESKTOP_SCROLL_STEP = 356;

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
  initials,
  name,
  relation,
  location,
  country,
  featured,
  quote,
}: (typeof VOICES_TESTIMONIALS)[number]) {
  return (
    <article
      className={cn(
        "glass-panel flex h-auto min-h-[280px] w-[calc(85vw)] shrink-0 snap-start flex-col gap-4 rounded-lg border border-white/10 p-6 md:w-[340px]",
        featured && "border-l-[3px] border-l-primary",
      )}
    >
      <Quote className="h-5 w-5 shrink-0 text-primary" aria-hidden />
      <p className="text-eyebrow text-xs">
        {relation} · {location}
      </p>
      <p className="card-quote flex-1 text-base leading-relaxed text-white/90">{quote}</p>
      <div className="card-footer mt-auto flex items-center gap-3 pt-2">
        <span className="ring-background flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/60 text-xs font-medium text-primary">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="font-medium text-white">{name}</p>
          <p className="mt-0.5 font-manrope text-[11px] font-normal leading-snug text-[#555555]">
            {country}
          </p>
        </div>
      </div>
    </article>
  );
}

export function VoicesThatStayedSection({ className }: { className?: string }) {
  const scrollRef = useDraggableScroll();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const getScrollStep = useCallback(() => {
    const track = scrollRef.current;
    if (!track) return DESKTOP_SCROLL_STEP;
    const card = track.querySelector<HTMLElement>("article");
    if (!card) return DESKTOP_SCROLL_STEP;
    return card.offsetWidth + SCROLL_GAP_PX;
  }, []);

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
  }, [updateScrollState]);

  const scrollByCard = (direction: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: direction * getScrollStep(), behavior: "smooth" });
  };

  return (
    <section
      className={cn("border-t border-[#1a1a1a] bg-background text-foreground", className)}
      aria-label="Family testimonials"
    >
      <div className="mx-auto max-w-[1200px] px-6 pt-16 pb-16 md:px-12 md:pt-24 md:pb-20">
        <header className="mx-auto mb-12 max-w-[640px] text-center">
          <p className="voices-testimonials-eyebrow">Families preserving their legacy</p>
          <h2 className="voices-testimonials-heading mt-4">Their story didn&apos;t end there.</h2>
          <p className="voices-testimonials-subheading mt-4">
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

        <div className="relative overflow-hidden">
          <div
            ref={scrollRef}
            data-draggable
            className={cn(
              "flex items-stretch gap-4 overflow-x-auto overscroll-x-contain pb-2 pr-6 md:pr-12",
              "snap-x snap-mandatory scroll-smooth",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            )}
            style={{ WebkitOverflowScrolling: "touch" }}
            aria-label="Family testimonial cards"
          >
            {VOICES_TESTIMONIALS.map((item) => (
              <VoiceCard key={item.name} {...item} />
            ))}
          </div>
        </div>

        <div className="mt-12">
          <ChainMotif />
        </div>
      </div>
    </section>
  );
}
