import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

/** Rows above/below center — middle row is always the active locale */
const RAIL_OFFSETS = [-2, -1, 0, 1, 2] as const;

type WelcomeLocaleRailProps = {
  isLight?: boolean;
  theme: WelcomeTheme;
  onThemeChange: (theme: WelcomeTheme) => void;
  layout?: ToolbarControlsLayout;
  rail?: LocaleRailLayout;
  showLocaleRailBg?: boolean;
};

function optionAtOffset(activeIndex: number, offset: number): WelcomeLanguageOption {
  const n = WELCOME_LANGUAGE_OPTIONS.length;
  const idx = (((activeIndex + offset) % n) + n) % n;
  return WELCOME_LANGUAGE_OPTIONS[idx];
}

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
  const prevIndexRef = useRef(0);
  const [stepDirection, setStepDirection] = useState<1 | -1 | 0>(0);

  const activeIndex = Math.max(
    0,
    WELCOME_LANGUAGE_OPTIONS.findIndex((o) => o.locale === locale),
  );
  const activeOption = WELCOME_LANGUAGE_OPTIONS[activeIndex];
  const pinCopy = welcomeCopyForLocale(locale);
  const isLightTheme = theme === "light";
  const autoMs = Math.max(1, rail.autoRotateSec) * 1000;
  const sunGapPx = toolbar?.controlsGapPx ?? 0;
  const dotTrackPx = Math.max(rail.dotSizePx, rail.activeDotSizePx);
  const slotHeightPx = dotTrackPx + rail.dotStackGapPx;
  const slotWidthPx = dotTrackPx + rail.dotStackGapPx;
  /** Flag + code + gap + dot — vertical rail was 62px (sun only) and clipped CN/GH */
  const centerLabelWidthPx = Math.ceil(
    rail.flagWidthPx + 10 + rail.labelFontPx * 2.75 + rail.labelToDotGapPx + dotTrackPx * 0.5,
  );
  const railClusterWidthPx = Math.max(rail.sunSizePx, centerLabelWidthPx + dotTrackPx);
  const centerSlotWidthPx = Math.max(dotTrackPx, centerLabelWidthPx);
  const railViewportHeightPx = slotHeightPx * RAIL_OFFSETS.length - rail.dotStackGapPx;
  const railViewportWidthPx =
    centerSlotWidthPx +
    slotWidthPx * (RAIL_OFFSETS.length - 1) +
    rail.dotStackGapPx * (RAIL_OFFSETS.length - 1);

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
    const prev = prevIndexRef.current;
    const n = WELCOME_LANGUAGE_OPTIONS.length;
    let diff = activeIndex - prev;
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;
    if (diff !== 0) setStepDirection(diff > 0 ? 1 : -1);
    prevIndexRef.current = activeIndex;
  }, [activeIndex]);

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

  /** Next locale: vertical stack slides up; horizontal bar slides left. */
  const enterY =
    stepDirection === 1 ? slotHeightPx * 0.55 : stepDirection === -1 ? -slotHeightPx * 0.55 : 0;
  const exitY =
    stepDirection === 1 ? -slotHeightPx * 0.55 : stepDirection === -1 ? slotHeightPx * 0.55 : 0;
  const enterX =
    stepDirection === 1 ? slotWidthPx * 0.55 : stepDirection === -1 ? -slotWidthPx * 0.55 : 0;
  const exitX =
    stepDirection === 1 ? -slotWidthPx * 0.55 : stepDirection === -1 ? slotWidthPx * 0.55 : 0;

  const LocaleRowVertical = ({
    option,
    offset,
  }: {
    option: WelcomeLanguageOption;
    offset: number;
  }) => {
    const isCenter = offset === 0;
    return (
      <div
        className="relative flex shrink-0 items-center justify-center"
        style={{ width: isCenter ? railClusterWidthPx : dotTrackPx, height: dotTrackPx }}
      >
        <div
          className="absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-end whitespace-nowrap"
          style={{
            right: `calc(50% + ${dotTrackPx / 2}px + ${isCenter ? rail.labelToDotGapPx : rail.inactiveLabelGapPx}px)`,
            maxWidth: isCenter ? `${centerLabelWidthPx}px` : undefined,
            ...nudgeX(rail.labelNudgeXRem),
          }}
        >
          {isCenter ? (
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
          <button
            type="button"
            className={dotClass(isCenter)}
            style={{
              width: isCenter ? rail.activeDotSizePx : rail.dotSizePx,
              height: isCenter ? rail.activeDotSizePx : rail.dotSizePx,
            }}
            role="option"
            aria-selected={isCenter}
            title={option.title}
            aria-label={isCenter ? undefined : `${option.code} — ${option.title}`}
            onClick={() => selectOption(option)}
            tabIndex={isCenter ? 0 : -1}
          />
        </div>
      </div>
    );
  };

  const LocaleRowHorizontal = ({
    option,
    offset,
  }: {
    option: WelcomeLanguageOption;
    offset: number;
  }) => {
    const isCenter = offset === 0;
    return (
      <div
        className="relative flex shrink-0 flex-col items-center justify-center"
        style={{
          width: isCenter ? centerSlotWidthPx : dotTrackPx,
          minHeight: dotTrackPx + (isCenter ? 28 : 0),
        }}
      >
        {isCenter ? (
          <button
            type="button"
            id={`welcome-locale-${option.code}`}
            role="option"
            aria-selected
            title={option.title}
            aria-label={`${option.code} — ${option.title}`}
            onClick={() => selectOption(option)}
            className="mb-1 flex items-center gap-2"
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
        ) : (
          <span className="mb-1 block h-5" aria-hidden />
        )}
        <button
          type="button"
          className={dotClass(isCenter)}
          style={{
            width: isCenter ? rail.activeDotSizePx : rail.dotSizePx,
            height: isCenter ? rail.activeDotSizePx : rail.dotSizePx,
          }}
          role="option"
          aria-selected={isCenter}
          title={option.title}
          aria-label={isCenter ? undefined : `${option.code} — ${option.title}`}
          onClick={() => selectOption(option)}
          tabIndex={isCenter ? 0 : -1}
        />
      </div>
    );
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
  );

  if (isMobile) {
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
              : isLight
                ? "bg-white/80"
                : "bg-black/50",
          )}
        >
          <nav
            className="relative overflow-x-visible overflow-y-hidden"
            style={{ width: railViewportWidthPx, height: dotTrackPx + 28 }}
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
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={activeIndex}
                className="flex h-full items-end"
                style={{ gap: rail.dotStackGapPx, paddingTop: 28 }}
                initial={{ x: enterX, opacity: 0.78 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: exitX, opacity: 0.78 }}
                transition={{ duration: 0.32, ease: [0.12, 0.23, 0.5, 1] }}
              >
                {RAIL_OFFSETS.map((offset) => (
                  <LocaleRowHorizontal
                    key={offset}
                    offset={offset}
                    option={optionAtOffset(activeIndex, offset)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </nav>
          {sunButton}
          <p className="sr-only" aria-live="polite">
            {welcomeToolbarCode(locale)}
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="pointer-events-none fixed z-40 hidden origin-right flex-col items-center sm:flex"
      style={asidePosition}
      aria-label="Language"
    >
      <div
        className="pointer-events-auto flex flex-col items-center"
        style={{ width: railClusterWidthPx, gap: sunGapPx }}
      >
        <nav
          className={cn(
            "relative flex w-full flex-col items-center overflow-x-visible overflow-y-hidden",
            showLocaleRailBg && "rounded-2xl border px-3 py-4",
            showLocaleRailBg &&
              (isLight ? "border-black/15 bg-white/90" : "border-white/10 bg-black/40"),
          )}
          style={{ height: railViewportHeightPx }}
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
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={activeIndex}
              className="flex w-full flex-col items-center"
              style={{ gap: rail.dotStackGapPx }}
              initial={{ y: enterY, opacity: 0.78 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: exitY, opacity: 0.78 }}
              transition={{ duration: 0.32, ease: [0.12, 0.23, 0.5, 1] }}
            >
              {RAIL_OFFSETS.map((offset) => (
                <LocaleRowVertical
                  key={offset}
                  offset={offset}
                  option={optionAtOffset(activeIndex, offset)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </nav>

        <p className="sr-only" aria-live="polite">
          {welcomeToolbarCode(locale)}
        </p>

        <div
          className="flex justify-center"
          style={nudgeX(rail.sunAxisNudgeXRem, rail.sunAxisNudgeYRem)}
        >
          {sunButton}
        </div>
      </div>
    </aside>
  );
}
