import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { VOICES_TESTIMONIALS } from "@/lib/legacy/voicesTestimonials";
import { cn } from "@/lib/utils";

const SCROLL_GAP_PX = 16;
const DESKTOP_SCROLL_STEP = 356; // 340px card + 16px gap

function ChainMotif() {
  return (
    <div className="mt-8 flex flex-col items-center px-6">
      <div className="flex items-center" role="presentation">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center">
            {i > 0 ? <span className="h-px w-8 bg-[#1e1e1e]" aria-hidden /> : null}
            <span
              className={cn(
                "block h-2 w-2 shrink-0 rounded-full",
                i === 2
                  ? "border border-[#2a2a2a] bg-[#0d0d0d]"
                  : "bg-[#E6A817]",
              )}
              style={
                i !== 2 ? { boxShadow: "0 0 6px rgba(230,168,23,0.25)" } : undefined
              }
              aria-hidden
            />
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[10px] uppercase tracking-[0.3em] text-[#333333]">
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
        "w-[calc(85vw)] shrink-0 snap-start border-[0.5px] border-[#1e1e1e] bg-[#111111] px-5 py-6 md:w-[340px]",
        featured
          ? "rounded-l-none rounded-r-[12px] border-l-2 border-l-[#E6A817] bg-[#0e0c00] pl-[18px]"
          : "rounded-[12px]",
      )}
    >
      <span
        className="mb-2 block text-[28px] leading-none text-[#E6A817]/50"
        aria-hidden
      >
        &ldquo;
      </span>
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#555555]">
        {relation} · {location}
      </p>
      <p className="my-2.5 mb-[18px] text-sm italic leading-[1.75] text-[#cccccc]">
        {quote}
      </p>
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#2e2200] bg-[#1e1800] text-[11px] font-medium text-[#E6A817]">
          {initials}
        </span>
        <div>
          <p className="text-[13px] font-medium text-white">{name}</p>
          <p className="flex items-center gap-1.5 text-[11px] text-[#555555]">
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
    const track = scrollRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * getScrollStep(), behavior: "smooth" });
  };

  return (
    <section
      className={cn("bg-[#0a0a0a] py-24 text-white", className)}
      aria-labelledby="voices-heading"
    >
      <div className="mb-8 px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#888888]">
          From families who trusted Beiza
        </p>
        <h2 id="voices-heading" className="mt-3 text-display-lg text-white">
          Voices that stayed.
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-[#888888]">
          A farewell is just one moment in a longer chain. Their stories travel forward.
        </p>
      </div>

      <div className="relative w-full overflow-hidden">
        <div
          ref={scrollRef}
          className={cn(
            "flex flex-row gap-4 overflow-x-auto overscroll-x-contain px-6 pb-2",
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

      <div className="mt-6 flex gap-3 px-6">
        <button
          type="button"
          aria-label="Previous testimonial"
          disabled={!canScrollPrev}
          onClick={() => scrollByCard(-1)}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[0.5px] border-[#2a2a2a] bg-[#1a1a1a] text-[#888888] transition-opacity",
            !canScrollPrev && "pointer-events-none opacity-30",
          )}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Next testimonial"
          disabled={!canScrollNext}
          onClick={() => scrollByCard(1)}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E6A817] text-[#0a0a0a] transition-opacity",
            !canScrollNext && "pointer-events-none opacity-30",
          )}
        >
          <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      </div>

      <ChainMotif />
    </section>
  );
}
