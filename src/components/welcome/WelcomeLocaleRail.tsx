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
  const inactiveOptions = WELCOME_LANGUAGE_OPTIONS.filter((_, i) => i !== activeIndex);
  const pinCopy = welcomeCopyForLocale(locale);
  const isLightTheme = theme === "light";
  const autoMs = Math.max(1, rail.autoRotateSec) * 1000;
  const sunGapPx = toolbar?.controlsGapPx ?? 0;
  const clusterWidthPx = rail.sunSizePx;
  const dotTrackPx = Math.max(rail.dotSizePx, rail.activeDotSizePx);

  const nudgeX = (xRem: number, yRem = 0) => {
    if (xRem === 0 && yRem === 0) return undefined;
    const parts: string[] = [];
    if (xRem !== 0) parts.push(`translateX(${-xRem}rem)`);
    if (yRem !== 0) parts.push(`translateY(${yRem}rem)`);
    return { transform: parts.join(" ") };
  };

  const selectOption = useCallback(
    (option: WelcomeLanguageOption) => {
      setLocale(option.locale);
    },
    [setLocale],
  );

  useEffect(() => {
    const pause = () => {
      pauseAutoRef.current = true;
      window.setTimeout(() => {
        pauseAutoRef.current = false;
      }, 6000);
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
    if (holdRef.current) {
      clearTimeout(holdRef.current);
      holdRef.current = null;
    }
  };

  const asideTransform = `translateY(-50%)${rail.railNudgeXRem ? ` translateX(${-rail.railNudgeXRem}rem)` : ""}`;
  const asidePosition = toolbar
    ? {
        right: `${toolbar.railRightRem}rem`,
        top: `${toolbar.railTopPct}%`,
        transform: asideTransform,
      }
    : {
        right: "1.75rem",
        top: "50%",
        transform: asideTransform,
      };

  const dotClass = (active: boolean) =>
    cn(
      "shrink-0 rounded-full border-0 transition-colors duration-200",
      active
        ? "bg-[#f5c518]"
        : isLight
          ? "bg-black/25 hover:bg-black/40"
          : "bg-[#6b6b6b] hover:bg-[#858585]",
    );

  const RailDotSlot = ({
    size,
    active,
    onClick,
    "aria-label": ariaLabel,
    ...rest
  }: {
    size: number;
    active: boolean;
    onClick?: () => void;
    "aria-label"?: string;
    "aria-hidden"?: boolean;
    tabIndex?: number;
    role?: string;
    "aria-selected"?: boolean;
    title?: string;
    id?: string;
  }) => (
    <div
      className="flex shrink-0 items-center justify-center"
      style={{ width: dotTrackPx, height: dotTrackPx }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={dotClass(active)}
        style={{ width: size, height: size }}
        {...rest}
      />
    </div>
  );

  /** Dot centers sit on sun centerline; labels extend left */
  const LocaleRow = ({
    option,
    active,
  }: {
    option: WelcomeLanguageOption;
    active: boolean;
  }) => (
    <div
      className="relative flex items-center"
      style={{ width: clusterWidthPx, minHeight: dotTrackPx }}
    >
      <div
        className="absolute top-1/2 flex -translate-y-1/2 items-center justify-end"
        style={{
          right: `calc(50% + ${dotTrackPx / 2}px + ${active ? rail.labelToDotGapPx : rail.inactiveLabelGapPx}px)`,
          ...nudgeX(rail.labelNudgeXRem),
        }}
      >
        {active ? (
          <button
            type="button"
            id={`welcome-locale-${option.code}`}
            role="option"
            aria-selected
            title={option.title}
            aria-label={`${option.code} — ${option.title}`}
            onClick={() => selectOption(option)}
            className="flex items-center gap-2.5"
          >
            <span
              className="inline-flex shrink-0 overflow-hidden rounded-[1px]"
              style={{ width: rail.flagWidthPx, height: rail.flagHeightPx }}
            >
              <WelcomeLocaleFlag code={option.code} className="h-full w-full" />
            </span>
            <span
              className={cn(
                "shrink-0 font-bold leading-none tracking-wide",
                isLight ? "text-black" : "text-white",
              )}
              style={{ fontSize: rail.labelFontPx }}
            >
              {option.code}
            </span>
          </button>
        ) : rail.showInactiveCodes ? (
          <button
            type="button"
            role="option"
            aria-selected={false}
            title={option.title}
            aria-label={`${option.code} — ${option.title}`}
            onClick={() => selectOption(option)}
            className={cn(
              "text-[11px] font-bold uppercase tracking-wide opacity-50",
              isLight ? "text-black" : "text-white",
            )}
          >
            {option.code}
          </button>
        ) : null}
      </div>

      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={nudgeX(rail.axisNudgeXRem)}
      >
        <RailDotSlot
          size={active ? rail.activeDotSizePx : rail.dotSizePx}
          active={active}
          role="option"
          aria-selected={active}
          title={option.title}
          aria-label={active ? undefined : `${option.code} — ${option.title}`}
          onClick={() => selectOption(option)}
          aria-hidden={active ? true : undefined}
          tabIndex={active ? -1 : undefined}
        />
      </div>
    </div>
  );

  return (
    <aside
      className="pointer-events-none fixed z-40 flex flex-col items-center"
      style={asidePosition}
      aria-label="Language"
    >
      <div
        className="pointer-events-auto flex flex-col items-center"
        style={{ width: clusterWidthPx, gap: sunGapPx }}
      >
        <nav
          className={cn(
            "flex w-full flex-col items-center",
            showLocaleRailBg && "rounded-2xl border px-3 py-4",
            showLocaleRailBg &&
              (isLight ? "border-black/15 bg-white/90" : "border-white/10 bg-black/40"),
          )}
          style={{ gap: rail.dotStackGapPx }}
          role="listbox"
          aria-label="Region & language"
          aria-activedescendant={`welcome-locale-${activeOption.code}`}
          onPointerEnter={() => {
            pauseAutoRef.current = true;
          }}
          onPointerLeave={() => {
            pauseAutoRef.current = false;
          }}
        >
          {inactiveOptions.map((option) => (
            <LocaleRow key={option.code} option={option} active={false} />
          ))}
          <LocaleRow option={activeOption} active />
        </nav>

        <p className="sr-only" aria-live="polite">
          {welcomeToolbarCode(locale)}
        </p>

        <div
          className="flex justify-center"
          style={nudgeX(rail.sunAxisNudgeXRem, rail.sunAxisNudgeYRem)}
        >
          <button
            type="button"
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full border bg-transparent transition",
              isLight
                ? "border-black/25 text-black hover:bg-black/5"
                : "border-[#5a5a5a] text-white hover:bg-white/5",
            )}
            style={{ width: rail.sunSizePx, height: rail.sunSizePx }}
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
        </div>
      </div>
    </aside>
  );
}
