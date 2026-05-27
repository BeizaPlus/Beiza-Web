import { useRef, type CSSProperties } from "react";
import { Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocaleContext } from "@/context/LocaleContext";
import { WelcomeLocaleFlag } from "@/components/welcome/WelcomeLocaleFlag";
import { type WelcomeTheme } from "@/components/welcome/WelcomeThemeToggle";
import { welcomeCopyForLocale } from "@/lib/locale/welcomeCopy";
import {
  WELCOME_LANGUAGE_OPTIONS,
  welcomeToolbarCode,
} from "@/lib/locale/welcomeLanguageOptions";
import {
  DEFAULT_LOCALE_RAIL_LAYOUT,
  type LocaleRailLayout,
  type ToolbarControlsLayout,
} from "@/lib/welcomeStudio";
import { useWelcomeLocaleRailBehavior } from "@/hooks/useWelcomeLocaleRailBehavior";
import { useWelcomeMobileLayout } from "@/hooks/useWelcomeViewport";

type WelcomeLocaleRailProps = {
  isLight?: boolean;
  theme: WelcomeTheme;
  onThemeChange: (theme: WelcomeTheme) => void;
  layout?: ToolbarControlsLayout;
  rail?: LocaleRailLayout;
  showLocaleRailBg?: boolean;
};

/** Dot column — shared center axis; inactive dots scale down from center (not top-left). */
function LocaleRailDot({
  isActive,
  rail,
  isLight,
  axisNudge,
}: {
  isActive: boolean;
  rail: LocaleRailLayout;
  isLight: boolean;
  axisNudge?: CSSProperties;
}) {
  const axisPx = Math.max(rail.dotSizePx, rail.activeDotSizePx);
  const scale = isActive ? 1 : rail.dotSizePx / axisPx;

  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{ width: axisPx, height: axisPx, ...axisNudge }}
      aria-hidden
    >
      <span
        className="block rounded-full transition-[transform,background-color,box-shadow] duration-200 ease-out"
        style={{
          width: axisPx,
          height: axisPx,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          backgroundColor: isActive ? "#f5c518" : isLight ? "rgba(0,0,0,0.25)" : "#6b6b6b",
          boxShadow: isActive ? "0 0 0 2px rgba(245,197,24,0.3)" : undefined,
        }}
      />
    </span>
  );
}

/** Studio nudge — positive X moves cluster left; positive Y moves down (rem). */
function nudgeStyle(xRem: number, yRem = 0): CSSProperties | undefined {
  if (xRem === 0 && yRem === 0) return undefined;
  const parts: string[] = [];
  if (xRem !== 0) parts.push(`translateX(${-xRem}rem)`);
  if (yRem !== 0) parts.push(`translateY(${yRem}rem)`);
  return { transform: parts.join(" ") };
}

function useWelcomeSunButton({
  isLight,
  theme,
  onThemeChange,
  rail,
}: Pick<WelcomeLocaleRailProps, "isLight" | "theme" | "onThemeChange" | "rail"> & {
  rail: LocaleRailLayout;
}) {
  const { locale, localePinned, setLocalePinned } = useLocaleContext();
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinCopy = welcomeCopyForLocale(locale);
  const isLightTheme = theme === "light";
  const dotAxisPx = Math.max(rail.dotSizePx, rail.activeDotSizePx);
  const sunRadius = rail.sunSizePx / 2;
  const sunMarginRight = sunRadius - dotAxisPx / 2;

  const clearHold = () => {
    if (holdRef.current) {
      clearTimeout(holdRef.current);
      holdRef.current = null;
    }
  };

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

  return sunButton;
}

function WelcomeLocaleRailMobile({
  isLight = false,
  theme,
  onThemeChange,
  rail: railProp,
}: WelcomeLocaleRailProps) {
  const rail = railProp ?? DEFAULT_LOCALE_RAIL_LAYOUT;
  const sunButton = useWelcomeSunButton({ isLight, theme, onThemeChange, rail });

  return (
    <aside
      className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 max-[809px]:block min-[810px]:hidden"
      aria-label="Theme"
    >
      <div
        className="pointer-events-auto"
        style={nudgeStyle(rail.sunAxisNudgeXRem, rail.sunAxisNudgeYRem)}
      >
        {sunButton}
      </div>
    </aside>
  );
}

function WelcomeLocaleRailDesktop({
  isLight = false,
  theme,
  onThemeChange,
  layout,
  rail: railProp,
}: WelcomeLocaleRailProps) {
  const toolbar = layout;
  const rail = railProp ?? DEFAULT_LOCALE_RAIL_LAYOUT;
  const { locale } = useLocaleContext();
  const { activeIndex, activeOption, selectOption, pauseAutoHandlers } =
    useWelcomeLocaleRailBehavior(rail);
  const sunButton = useWelcomeSunButton({ isLight, theme, onThemeChange, rail });
  const sunGapPx = toolbar?.controlsGapPx ?? 32;
  const dotAxisPx = Math.max(rail.dotSizePx, rail.activeDotSizePx);

  const asideTransform = `translateY(-50%)${rail.railNudgeXRem ? ` translateX(${-rail.railNudgeXRem}rem)` : ""}`;
  const asidePosition = toolbar
    ? { right: `${toolbar.railRightRem}rem`, top: `${toolbar.railTopPct}%`, transform: asideTransform }
    : { right: "1.75rem", top: "50%", transform: asideTransform };

  return (
    <aside
      className="pointer-events-none fixed z-40 hidden origin-right min-[810px]:flex"
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
            {...pauseAutoHandlers}
          >
            {WELCOME_LANGUAGE_OPTIONS.map((option, i) => {
              const isActive = i === activeIndex;
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
                  style={{
                    minHeight: dotAxisPx,
                    gap: isActive
                      ? rail.labelToDotGapPx
                      : rail.showInactiveCodes
                        ? rail.inactiveLabelGapPx
                        : 0,
                  }}
                >
                  {(isActive || rail.showInactiveCodes) && (
                    <span
                      className="flex shrink-0 items-center"
                      style={{
                        gap: isActive ? 10 : rail.inactiveLabelGapPx,
                        ...nudgeStyle(rail.labelNudgeXRem),
                      }}
                    >
                      {isActive && (
                        <span
                          className="inline-flex shrink-0 overflow-hidden rounded-[1px]"
                          style={{ width: rail.flagWidthPx, height: rail.flagHeightPx }}
                        >
                          <WelcomeLocaleFlag code={option.code} className="h-full w-full" />
                        </span>
                      )}
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
                    </span>
                  )}
                  <LocaleRailDot
                    isActive={isActive}
                    rail={rail}
                    isLight={isLight}
                    axisNudge={nudgeStyle(rail.axisNudgeXRem)}
                  />
                </button>
              );
            })}
          </nav>

          <p className="sr-only" aria-live="polite">{welcomeToolbarCode(locale)}</p>

          <div
            className="flex justify-end"
            style={{
              marginTop: sunGapPx,
              ...nudgeStyle(rail.sunAxisNudgeXRem, rail.sunAxisNudgeYRem),
            }}
          >
            {sunButton}
          </div>
        </div>
      </aside>
  );
}

export function WelcomeLocaleRail(props: WelcomeLocaleRailProps) {
  const isMobile = useWelcomeMobileLayout();
  if (isMobile) return <WelcomeLocaleRailMobile {...props} />;
  return <WelcomeLocaleRailDesktop {...props} />;
}
