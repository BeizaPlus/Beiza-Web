import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { VOICES_TESTIMONIALS } from "@/lib/legacy/voicesTestimonials";
import { cn } from "@/lib/utils";

const SCROLL_GAP_PX = 16;
const DESKTOP_SCROLL_STEP = 356;

const controlButtonClass =
  "ring-background flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30";

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
  flag,
  country,
  featured,
  quote,
}: (typeof VOICES_TESTIMONIALS)[number]) {
  return (
    <article
      className={cn(
        "glass-panel flex h-full w-[calc(85vw)] shrink-0 snap-start flex-col gap-4 rounded-lg border border-white/10 p-6 md:w-[340px]",
        featured && "ring-1 ring-primary/35",
      )}
    >
      <Quote className="h-5 w-5 shrink-0 text-primary" aria-hidden />
      <p className="text-eyebrow text-xs">
        {relation} · {location}
      </p>
      <p className="flex-1 text-base leading-relaxed text-white/90">{quote}</p>
      <div className="flex items-center gap-3 pt-2">
        <span className="ring-background flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/60 text-xs font-medium text-primary">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="font-medium text-white">{name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-subtle">
            <span
              className="leading-none"
              style={{
                fontFamily:
                  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
              }}
              aria-hidden
            >
              {flag}
            </span>
            <span>{country}</span>
          </p>
        </div>
      </div>
    </article>
  );
}

export function VoicesThatStayedSection({ className }: { className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
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
      className={cn("bg-background py-24 text-foreground lg:py-32", className)}
      aria-label="Voices that stayed — family testimonials"
    >
      <div className="mx-auto max-w-6xl px-[5%]">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="From families who trusted Beiza"
            title="Voices that stayed."
            description="A farewell is just one moment in a longer chain. Their stories travel forward."
            align="center"
            className="md:items-start md:text-left"
          />
          <div className="flex shrink-0 justify-center gap-2 md:justify-end">
            <button
              type="button"
              aria-label="Previous testimonial"
              disabled={!canScrollPrev}
              onClick={() => scrollByCard(-1)}
              className={controlButtonClass}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              disabled={!canScrollNext}
              onClick={() => scrollByCard(1)}
              className={controlButtonClass}
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="relative mt-10 w-full overflow-hidden">
          <div
            ref={scrollRef}
            className={cn(
              "flex gap-4 overflow-x-auto overscroll-x-contain pb-2",
              "snap-x snap-mandatory scroll-smooth",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            )}
            style={{ WebkitOverflowScrolling: "touch" }}
            aria-label="Family testimonials"
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
