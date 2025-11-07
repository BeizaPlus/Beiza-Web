import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import clsx from "clsx";

export type Testimonial = {
  quote: string;
  author: string;
  role?: string;
};

export type TestimonialsCarouselProps = {
  testimonials: Testimonial[];
  className?: string;
  variant?: "dark" | "light";
};

export const TestimonialsCarousel = ({ testimonials, className, variant = "dark" }: TestimonialsCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const wrapperClasses = clsx(
    "rounded-3xl border p-6 md:p-10",
    variant === "light"
      ? "border-black/10 bg-white text-black shadow-glass"
      : "glass-panel border-white/10 text-white"
  );

  const controlClasses = variant === "light"
    ? "flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-black/5 text-black transition hover:bg-black/10"
    : "ring-background flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/20";

  const cardClasses = variant === "light"
    ? "min-w-0 shrink-0 grow-0 basis-full space-y-4 rounded-3xl border border-black/10 bg-black/5 p-6 md:basis-1/2"
    : "min-w-0 shrink-0 grow-0 basis-full space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6 md:basis-1/2";

  const quoteClasses = variant === "light" ? "text-base leading-relaxed text-neutral-800" : "text-base leading-relaxed text-white";
  const authorClasses = variant === "light" ? "font-medium text-neutral-900" : "font-medium text-white";
  const roleClasses = variant === "light"
    ? "text-xs uppercase tracking-[0.3em] text-neutral-500"
    : "text-xs uppercase tracking-[0.3em] text-subtle";

  return (
    <section className={clsx("relative", className)}>
      <div className={wrapperClasses}>
        <div className="flex items-center justify-between gap-4">
          <div className="text-eyebrow text-xs uppercase tracking-[0.3em]">
            Testimonials
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={scrollPrev} className={controlClasses} aria-label="Previous testimonial">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={scrollNext} className={controlClasses} aria-label="Next testimonial">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden" ref={emblaRef}>
          <ul className="flex gap-6 pb-2">
            {testimonials.map((testimonial, index) => (
              <li key={`${testimonial.author}-${index}`} className={cardClasses}>
                <Quote className={clsx("h-6 w-6", variant === "light" ? "text-primary" : "text-primary")} />
                <p className={quoteClasses}>{testimonial.quote}</p>
                <div>
                  <p className={authorClasses}>{testimonial.author}</p>
                  {testimonial.role ? <p className={roleClasses}>{testimonial.role}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {testimonials.map((_, index) => (
            <span
              key={index}
              className={clsx(
                "h-1.5 w-6 rounded-full transition",
                variant === "light"
                  ? selected === index
                    ? "bg-neutral-900"
                    : "bg-neutral-300"
                  : selected === index
                    ? "bg-white"
                    : "bg-white/20"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
