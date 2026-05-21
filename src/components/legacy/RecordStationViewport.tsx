import type { ReactNode } from "react";
import type { CSSProperties } from "react";
import { useLocaleContext } from "@/context/LocaleContext";
import { FramedHeroImage } from "@/components/FramedHeroImage";
import { RecordHeroCta } from "@/components/legacy/RecordHeroCta";
import { useRecordFlowOptional } from "@/components/legacy/recordFlowContext";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import { getRecordStationHeroSources } from "@/lib/locale/recordHeroImages";
import { isGhanaEntryLocale } from "@/lib/locale/ghanaEntry";
import { RECORD_HERO_GHANA_DEFAULTS, RECORD_HERO_STUDIO_DEFAULTS } from "@/lib/legacy/recordHeroFrame";
import {
  loadRecordPageStudioFrame,
  recordColumnLayoutStyle,
  recordContentIndentX,
  recordPageShellCssVars,
  RECORD_PAGE_STUDIO_DEFAULTS,
  type RecordPageStudioFrame,
} from "@/lib/legacy/recordPageStudio";
import { siteHeroContentRow } from "@/lib/siteLayout";
import { cn } from "@/lib/utils";

type RecordStationViewportProps = {
  circleLabel?: string;
  station?: ReactNode;
  /** Live frame from Record page studio (dev) */
  studioFrame?: RecordPageStudioFrame;
};

/**
 * One-screen record station — hero is full viewport; site nav + tab bar overlay on top.
 */
export function RecordStationViewport({
  circleLabel,
  station,
  studioFrame: studioFrameProp,
}: RecordStationViewportProps) {
  const { locale } = useLocaleContext();
  const { primary: hero, fallback: heroFallback } = getRecordStationHeroSources(locale);
  const ghana = isGhanaEntryLocale(locale);
  const studioOn = isLayoutStudioEnabled();
  const codeDefaults = {
    ...RECORD_PAGE_STUDIO_DEFAULTS,
    ...(ghana ? RECORD_HERO_GHANA_DEFAULTS : RECORD_HERO_STUDIO_DEFAULTS),
  };
  const frame =
    studioFrameProp ?? (studioOn ? loadRecordPageStudioFrame() : codeDefaults);
  const heroFrame = frame;
  const cssVars = recordPageShellCssVars(heroFrame) as CSSProperties;
  const columnStyle = recordColumnLayoutStyle(frame);
  const textRight = heroFrame.textSide === "right";
  const flow = useRecordFlowOptional();
  const stationPhase = flow?.snapshot.phase ?? "prepare";
  const stationExpanded = stationPhase === "upload" || stationPhase === "seal";

  return (
    <section
      className="record-station-viewport absolute inset-0 z-0 h-full w-full overflow-hidden pt-[var(--record-site-nav-h,4.5rem)]"
      style={cssVars}
      aria-label="Recording station"
    >
      <style>{`
        .record-station-viewport .record-viewport-overlay {
          background: var(--record-overlay-mobile, linear-gradient(to top, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.2) 100%));
        }
        @media (min-width: 768px) {
          .record-station-viewport .record-viewport-overlay {
            background: var(--record-overlay-md, var(--heritage-overlay-md));
          }
        }
      `}</style>

      <FramedHeroImage
        src={hero.src}
        alt={hero.alt}
        frame={heroFrame}
        className="pointer-events-none"
        onErrorSrc={heroFallback.src}
      />
      <div className="record-viewport-overlay pointer-events-none absolute inset-0" aria-hidden />

      <div
        className={cn(
          "relative z-10 flex h-full min-h-0 w-full",
          siteHeroContentRow,
          textRight ? "md:justify-end" : "md:justify-start",
        )}
      >
        <div
          className={cn(
            "flex w-full min-w-0 flex-col justify-center gap-4 overflow-hidden py-6 sm:py-8",
            stationExpanded && station ? "h-full min-h-0" : "min-h-0",
            "max-w-[var(--record-column-max,32rem)]",
            recordContentIndentX,
            textRight ? "md:ml-auto md:items-end md:text-right" : "md:mr-auto md:text-left",
          )}
          style={columnStyle}
        >
          <div className="shrink-0">
            <p className="text-eyebrow text-primary">Beiza Legacy · Record</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Record a memory
            </h1>
            <p
              className="mt-2 text-sm leading-snug text-white/85 sm:text-base"
              style={{ maxWidth: "var(--record-subtitle-max, 28rem)" }}
            >
              {circleLabel
                ? `For ${circleLabel}. Capture a voice or story, then seal it in your vault.`
                : "Capture a voice or story, then seal it in your family vault."}
            </p>
          </div>

          <div className={cn("shrink-0 w-full", textRight && "flex flex-col items-end")}>
            <RecordHeroCta textAlign={textRight ? "right" : "left"} />
          </div>

          {station ? (
            <div
              id="recording-station"
              className={cn(
                stationExpanded ? "min-h-0 flex-1 overflow-y-auto" : "shrink-0",
                textRight && "flex w-full flex-col items-end",
              )}
              style={{ maxWidth: "var(--record-column-max, 32rem)" }}
            >
              {station}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
