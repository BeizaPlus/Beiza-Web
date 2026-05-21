import type { BeizaLocale } from "@/lib/locale/types";
import { getCulturalImmersionVideo } from "@/lib/locale/culturalImmersionVideos";
import { cn } from "@/lib/utils";

type Props = {
  locale?: BeizaLocale;
  className?: string;
};

export function CulturalImmersionHero({ locale = "black-american", className }: Props) {
  const immersion = getCulturalImmersionVideo(locale);

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-white/10 bg-[#0a0a0a] text-white",
        className,
      )}
      aria-label="Cultural immersion"
    >
      <div className="relative aspect-[4/3] w-full max-h-[min(52vh,480px)] bg-black sm:aspect-video sm:max-h-[min(56vh,520px)]">
        {immersion.videoSrc ? (
          <video
            className="h-full w-full object-cover"
            src={immersion.videoSrc}
            poster={immersion.posterSrc}
            controls
            playsInline
          />
        ) : (
          <>
            <img
              src={immersion.posterSrc}
              alt={immersion.posterAlt}
              className="h-full w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/35">
              <span
                className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/80 bg-black/50 text-white"
                aria-hidden
              >
                <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 fill-current" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </div>
          </>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-[var(--beiza-site-padding-x,1.25rem)] pb-6 pt-12 sm:pb-10 sm:pt-16">
          <p className="font-manrope text-[10px] uppercase tracking-[0.28em] text-[#E6A817] sm:text-xs sm:tracking-[0.3em]">
            {immersion.eyebrow}
          </p>
          <h1 className="legacy-display mt-2 text-xl font-light sm:text-3xl md:text-4xl">{immersion.title}</h1>
          <p className="mt-3 max-w-2xl font-manrope text-sm leading-relaxed text-white/85 sm:text-base">
            {immersion.subtitle}
          </p>
          {!immersion.videoSrc ? (
            <p className="mt-3 font-manrope text-xs text-white/50">
              Immersion films for each region are on the way — your culture, in motion.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
