import type { ReactNode } from "react";
import type { CSSProperties } from "react";
import { useLocaleContext } from "@/context/LocaleContext";
import { FramedHeroImage } from "@/components/FramedHeroImage";
import { RecordHeroCta } from "@/components/legacy/RecordHeroCta";
import { heritageHeroStudioCssVars } from "@/components/dev/heroLayoutStudioState";
import { getRecordStationHeroImage } from "@/lib/locale/recordHeroImages";
import { isGhanaEntryLocale } from "@/lib/locale/ghanaEntry";
import { RECORD_HERO_GHANA_DEFAULTS, RECORD_HERO_STUDIO_DEFAULTS } from "@/lib/legacy/recordHeroFrame";
import { cn } from "@/lib/utils";

type RecordStationViewportProps = {
  circleLabel?: string;
  station?: ReactNode;
};

/**
 * One-screen record station — fills viewport below nav + tab bar (no page scroll).
 */
export function RecordStationViewport({ circleLabel, station }: RecordStationViewportProps) {
  const { locale } = useLocaleContext();
  const hero = getRecordStationHeroImage(locale);
  const frame = isGhanaEntryLocale(locale) ? RECORD_HERO_GHANA_DEFAULTS : RECORD_HERO_STUDIO_DEFAULTS;
  const cssVars = heritageHeroStudioCssVars(frame) as CSSProperties;
  const textRight = frame.textSide === "right";

  return (
    <section
      className="record-station-viewport relative min-h-0 flex-1 overflow-hidden"
      style={cssVars}
      aria-label="Recording station"
    >
      <style>{`
        .record-station-viewport .record-viewport-overlay {
          background: var(--heritage-overlay-mobile);
        }
        @media (min-width: 768px) {
          .record-station-viewport .record-viewport-overlay {
            background: var(--heritage-overlay-md);
          }
        }
      `}</style>

      <FramedHeroImage src={hero.src} alt={hero.alt} frame={frame} className="pointer-events-none" />
      <div className="record-viewport-overlay pointer-events-none absolute inset-0" aria-hidden />

      <div
        className={cn(
          "relative z-10 flex h-full min-h-0 w-full",
          textRight ? "md:justify-end" : "md:justify-start",
        )}
      >
        <div
          className={cn(
            "flex h-full min-h-0 w-full max-w-lg flex-col justify-center gap-3 overflow-hidden px-5 py-4 sm:px-8 sm:py-5",
            textRight ? "md:ml-auto md:items-end md:pr-12 md:text-right" : "md:mr-auto md:pl-12 md:text-left",
          )}
        >
          <div className="shrink-0">
            <p className="text-eyebrow text-primary">Beiza Legacy · Record</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Record a memory
            </h1>
            <p className="mt-2 max-w-md text-sm leading-snug text-white/85 sm:text-base">
              {circleLabel
                ? `For ${circleLabel}. Capture a voice or story, then seal it in your vault.`
                : "Capture a voice or story, then seal it in your family vault."}
            </p>
          </div>

          <div className={cn("shrink-0", textRight && "w-full max-w-md")}>
            <RecordHeroCta textAlign={textRight ? "right" : "left"} />
          </div>

          {station ? (
            <div
              id="recording-station"
              className={cn(
                "min-h-0 flex-1 overflow-hidden",
                textRight && "flex w-full max-w-md flex-col items-end",
              )}
            >
              {station}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
