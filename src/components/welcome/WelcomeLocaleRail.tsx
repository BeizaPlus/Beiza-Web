import { useCallback, useEffect, useRef } from "react";
import { Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocaleContext } from "@/context/LocaleContext";
import { WelcomeLocaleFlag } from "@/components/welcome/WelcomeLocaleFlag";
import { type WelcomeTheme } from "@/components/welcome/WelcomeThemeToggle";
import { welcomeCopyForLocale } from "@/lib/locale/welcomeCopy";
import {
  WELCOME_LANGUAGE_OPTIONS,
  welcomeToolbarCode,
  type WelcomeLanguageOption,
} from "@/lib/locale/welcomeLanguageOptions";
import {
  DEFAULT_LOCALE_RAIL_LAYOUT,
  type LocaleRailLayout,
  type ToolbarControlsLayout,
} from "@/lib/welcomeStudio";
import { WELCOME_SCENE_STEP_EVENT } from "@/lib/welcomeSceneWheel";
import { useWelcomeMobileLayout } from "@/hooks/useWelcomeViewport";

type WelcomeLocaleRailProps = {
  isLight?: boolean;
  theme: WelcomeTheme;
  onThemeChange: (theme: WelcomeTheme) => void;
  layout?: ToolbarControlsLayout;
  rail?: LocaleRailLayout;
  showLocaleRailBg?: boolean;
};

export function WelcomeLocaleRail({
  isLight = false,
  theme,
  onThemeChange,
  layout,
  rail: railProp,
  showLocaleRailBg = false,
}: WelcomeLocaleRailProps) {
  const isMobile = useWelcomeMobileLayout();
  const toolbar = layout;
  const rail = railProp ?? DEFAULT_LOCALE_RAIL_LAYOUT;
  const { locale, setLocale, localePinned, setLocalePinned } = useLocaleContext();
  const pauseAutoRef = useRef(false);
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeIndex = Math.max(
    0,
    WELCOME_LANGUAGE_OPTIONS.findIndex((o) => o.locale === locale),
  );
  const activeOption = WELCOME_LANGUAGE_OPTIONS[activeIndex];
  const pinCopy = welcomeCopyForLocale(locale);
  const isLightTheme = theme === "light";
  const autoMs = Math.max(1, rail.autoRotateSec) * 1000;
  const sunGapPx = toolbar?.controlsGapPx ?? 32;

  const selectOption = useCallback(
    (option: WelcomeLanguageOption) => {
      setLocale(option.locale);
    },
    [setLocale],
  );

  useEffect(() => {
    const pause = () => {
      pauseAutoRef.current = true;
      window.setTimeout(() => { pauseAutoRef.current = false; }, 6000);
    };
    window.addEventListener(WELCOME_SCENE_STEP_EVENT, pause);
    return () => window.removeEventListener(WELCOME_SCENE_STEP_EVENT, pause);
  }, []);

  useEffect(() => {
    if (localePinned) return;
    const id = window.setInterval(() => {
      if (pauseAutoRef.current) return;
      const next = (activeIndex + 1) % WELCOME_LANGUAGE_OPTIONS.length;
      selectOption(WELCOME_LANGUAGE_OPTIONS[next]);
    }, autoMs);
    return () => window.clearInterval(id);
  }, [activeIndex, autoMs, localePinned, selectOption]);

  const clearHold = () => {
    if (holdRef.current) { clearTimeout(holdRef.current); holdRef.current = null; }
  };

  const asideTransform = `translateY(-50%)${rail.railNudgeXRem ? ` translateX(${-rail.railNudgeXRem}rem)` : ""}`;
  const asidePosition = toolbar
    ? { right: `${toolbar.railRightRem}rem`, top: `${toolbar.railTopPct}%`, transform: asideTransform }
    : { right: "1.75rem", top: "50%", transform: asideTransform };

  // Dot center axis: right edge of container is the anchor. All dots
  // are right-aligned so their right edges meet the container right edge.
  // The sun button needs its CENTER to align with the dot centers:
  // dot center = containerRight - dotRadius
  // sun center = containerRight - sunRadius
  // → sun must shift left by (sunRadius - dotRadius) relative to container right
  const dotRadius = rail.activeDotSizePx / 2;
  const sunRadius = rail.sunSizePx / 2;
  const sunMarginRight = sunRadius - dotRadius;

  const sunButton = (
    <button
      type="button"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border bg-transparent transition",
        isLight
          ? "border-black/25 text-black hover:bg-black/5"
          : "border-[#5a5a5a] text-white hover:bg-white/5",
      )}
      style={{ width: rail.sunSizePx, height: rail.sunSizePx, marginRight: -sunMarginRight }}
      onClick={() => onThemeChange(isLightTheme ? "dark" : "light")}
      onPointerDown={() => {
        clearHold();
        holdRef.current = setTimeout(() => setLocalePinned(!localePinned), 480);
      }}
      onPointerUp={clearHold}
      onPointerLeave={clearHold}
      onPointerCancel={clearHold}
      aria-label={isLightTheme ? "Switch to dark background" : "Switch to light background"}
      title={
        localePinned
          ? `${pinCopy.unpinLabel} · ${isLightTheme ? "Dark mode" : "Light mode"}`
          : `${pinCopy.pinLabel} (hold) · ${isLightTheme ? "Dark mode" : "Light mode"}`
      }
    >
      <Sun
        className="shrink-0"
        style={{ width: rail.sunIconPx, height: rail.sunIconPx }}
        strokeWidth={1.35}
      />
    </button>
  );

  // Desktop: static vertical list, all locales, active shows flag+code+dot
  if (!isMobile) {
    return (
      <aside
        className="pointer-events-none fixed z-40 hidden origin-right sm:flex"
        style={asidePosition}
        aria-label="Language"
      >
        <div className="pointer-events-auto flex flex-col items-end">
          {/* Static dot column: all locales */}
          <nav
            className="flex flex-col items-end"
            style={{ gap: rail.dotStackGapPx }}
            role="listbox"
            aria-label="Region & language"
            aria-activedescendant={`welcome-locale-${activeOption.code}`}
            onPointerEnter={() => { pauseAutoRef.current = true; }}
            onPointerLeave={() => { pauseAutoRef.current = false; }}
          >
            {WELCOME_LANGUAGE_OPTIONS.map((option, i) => {
              const isActive = i === activeIndex;
              const dotSize = isActive ? rail.activeDotSizePx : rail.dotSizePx;
              return (
                <button
                  key={option.code}
                  id={isActive ? `welcome-locale-${option.code}` : undefined}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  title={option.title}
                  aria-label={`${option.code} — ${option.title}`}
                  onClick={() => selectOption(option)}
                  className="flex items-center"
                  style={{ gap: isActive ? rail.labelToDotGapPx : (rail.showInactiveCodes ? rail.inactiveLabelGapPx : 0) }}
                >
                  {/* Flag — active only */}
                  {isActive && (
                    <span
                      className="inline-flex shrink-0 overflow-hidden rounded-[1px]"
                      style={{ width: rail.flagWidthPx, height: rail.flagHeightPx }}
                    >
                      <WelcomeLocaleFlag code={option.code} className="h-full w-full" />
                    </span>
                  )}
                  {/* Code label — active always; inactive only when showInactiveCodes */}
                  {(isActive || rail.showInactiveCodes) && (
                    <span
                      className={cn(
                        "shrink-0 font-bold leading-none tracking-wide",
                        isLight ? "text-black" : "text-white",
                        !isActive && "opacity-40",
                      )}
                      style={{ fontSize: rail.labelFontPx }}
                    >
                      {option.code}
                    </span>
                  )}
                  {/* Dot */}
                  <div
                    className="shrink-0 rounded-full transition-colors duration-200"
                    style={{
                      width: dotSize,
                      height: dotSize,
                      backgroundColor: isActive
                        ? "#f5c518"
                        : isLight ? "rgba(0,0,0,0.25)" : "#6b6b6b",
                      boxShadow: isActive ? "0 0 0 2px rgba(245,197,24,0.3)" : undefined,
                    }}
                  />
                </button>
              );
            })}
          </nav>

          <p className="sr-only" aria-live="polite">{welcomeToolbarCode(locale)}</p>

          {/* Sun button — its center aligns to dot center axis via negative marginRight */}
          <div style={{ marginTop: sunGapPx + (rail.sunAxisNudgeYRem ? rail.sunAxisNudgeYRem * 16 : 0) }}>
            {sunButton}
          </div>
        </div>
      </aside>
    );
  }

  // Mobile: horizontal bottom bar
  return (
    <aside
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:hidden"
      aria-label="Language"
    >
      <div
        className={cn(
          "pointer-events-auto flex items-center gap-3 rounded-full px-4 py-2.5",
          showLocaleRailBg
            ? isLight
              ? "border border-black/15 bg-white/95 shadow-lg"
              : "border border-white/10 bg-black/85 shadow-lg"
            : isLight ? "bg-white/80" : "bg-black/50",
        )}
      >
        <nav
          className="flex items-end gap-3"
          role="listbox"
          aria-label="Region & language"
          aria-activedescendant={`welcome-locale-mobile-${activeOption.code}`}
          onPointerEnter={() => { pauseAutoRef.current = true; }}
          onPointerLeave={() => { pauseAutoRef.current = false; }}
        >
          {WELCOME_LANGUAGE_OPTIONS.map((option, i) => {
            const isActive = i === activeIndex;
            const dotSize = isActive ? rail.activeDotSizePx : rail.dotSizePx;
            return (
              <button
                key={option.code}
                id={isActive ? `welcome-locale-mobile-${option.code}` : undefined}
                type="button"
                role="option"
                aria-selected={isActive}
                title={option.title}
                aria-label={`${option.code} — ${option.title}`}
                onClick={() => selectOption(option)}
                className="flex flex-col items-center gap-1"
              >
                {isActive && (
                  <>
                    <span
                      className="inline-flex shrink-0 overflow-hidden rounded-[1px]"
                      style={{ width: rail.flagWidthPx, height: rail.flagHeightPx }}
                    >
                      <WelcomeLocaleFlag code={option.code} className="h-full w-full" />
                    </span>
                    <span
                      className={cn("shrink-0 font-bold leading-none tracking-wide", isLight ? "text-black" : "text-white")}
                      style={{ fontSize: rail.labelFontPx }}
                    >
                      {option.code}
                    </span>
                  </>
                )}
                <div
                  className="shrink-0 rounded-full transition-colors duration-200"
                  style={{
                    width: dotSize,
                    height: dotSize,
                    backgroundColor: isActive ? "#f5c518" : isLight ? "rgba(0,0,0,0.25)" : "#6b6b6b",
                  }}
                />
              </button>
            );
          })}
        </nav>
        {sunButton}
        <p className="sr-only" aria-live="polite">{welcomeToolbarCode(locale)}</p>
      </div>
    </aside>
  );
}
