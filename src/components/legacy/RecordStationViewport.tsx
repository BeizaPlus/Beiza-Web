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
import { useLayoutStudioBreakpoint } from "@/hooks/useLayoutStudioViewport";
import {
  loadRecordPageStudioFrame,
  recordColumnLayoutStyle,
  recordContentIndentX,
  recordPageFrameForViewport,
  recordPageShellCssVars,
  RECORD_PAGE_STUDIO_DEFAULTS,
  type RecordPageStudioFrame,
} from "@/lib/legacy/recordPageStudio";
import {
  LEGACY_AUTH_PAGE_STUDIO_ID,
  legacyAuthPageLayoutStyle,
  loadPageLayoutFrame,
  pageLayoutDefaultsFor,
} from "@/lib/pageLayoutStudio";
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
  const breakpoint = useLayoutStudioBreakpoint();
  const heroFrame = recordPageFrameForViewport(frame, breakpoint);
  const cssVars = recordPageShellCssVars(heroFrame) as CSSProperties;
  const isDesktop = breakpoint === "desktop";
  const authStationFrame = studioOn
    ? loadPageLayoutFrame(LEGACY_AUTH_PAGE_STUDIO_ID)
    : pageLayoutDefaultsFor(LEGACY_AUTH_PAGE_STUDIO_ID);
  /** Pasted JSON bindings apply on desktop only — phone/tablet stay centered. */
  const columnStyle = !isDesktop
    ? undefined
    : station
      ? legacyAuthPageLayoutStyle(authStationFrame)
      : recordColumnLayoutStyle(frame);
  const textRight = heroFrame.textSide === "right";
  const flow = useRecordFlowOptional();
  const stationPhase = flow?.snapshot.phase ?? "prepare";
  const stationExpanded = stationPhase === "upload" || stationPhase === "seal";
  const signedIn = !!station;

  return (
    <section
      className="record-station-viewport absolute inset-0 z-0 h-full w-full overflow-hidden pt-[var(--record-site-nav-h,4.5rem)]"
      style={cssVars}
      aria-label="Recording station"
    >
      <style>{`
        .record-station-viewport .record-viewport-overlay {
          background: var(--record-overlay-mobile, linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.15) 100%));
        }
        @media (max-width: 809px) {
          .record-station-viewport .record-copy-column {
            transform: none !important;
            margin-left: auto;
            margin-right: auto;
          }
        }
        @media (max-width: 1199px) {
          .record-station-viewport .record-copy-column {
            transform: none !important;
          }
        }
        @media (min-width: 810px) {
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
          "justify-center items-center",
          "px-[var(--beiza-site-padding-x,0.75rem)]",
          "min-[1200px]:pr-[calc(5.5rem+var(--beiza-site-padding-x,1.25rem))]",
          "max-[809px]:pb-[calc(6.25rem+env(safe-area-inset-bottom,0px))] max-[809px]:pt-4",
          textRight ? "min-[1200px]:justify-end" : "min-[1200px]:justify-start",
        )}
      >
        <div
          className={cn(
            "record-copy-column flex w-full min-w-0 flex-col overflow-hidden",
            signedIn ? "min-h-0 flex-1 justify-center gap-3" : "justify-center gap-4",
            "mx-auto max-w-[var(--record-column-max,22rem)]",
            "max-[1199px]:items-center max-[1199px]:text-center",
            "py-6 min-[1200px]:py-8",
            stationExpanded && station ? "h-full min-h-0" : "min-h-0",
            recordContentIndentX,
            textRight
              ? "min-[1200px]:ml-auto min-[1200px]:max-w-[var(--record-column-max,32rem)] min-[1200px]:items-end min-[1200px]:text-right"
              : "min-[1200px]:mr-auto min-[1200px]:max-w-[var(--record-column-max,32rem)] min-[1200px]:text-left",
          )}
          style={columnStyle}
        >
          {!signedIn ? (
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
          ) : null}

          <div
            className={cn(
              "w-full min-w-0 max-[1199px]:flex max-[1199px]:flex-col max-[1199px]:items-center",
              signedIn && "flex flex-1 flex-col items-center justify-center",
              !signedIn && "shrink-0",
              textRight && "min-[1200px]:flex min-[1200px]:flex-col min-[1200px]:items-end",
              signedIn && textRight && "min-[1200px]:items-end",
            )}
          >
            <RecordHeroCta textAlign={textRight ? "right" : "left"} />
          </div>

          {station ? (
            <div
              id="recording-station"
              className={cn(
                "min-h-0 w-full",
                signedIn ? "flex-1 overflow-y-auto" : stationExpanded ? "flex-1 overflow-y-auto" : "shrink-0",
                textRight && "flex flex-col items-end",
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
