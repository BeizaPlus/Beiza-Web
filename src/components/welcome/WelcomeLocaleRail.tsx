import { useCallback, useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pin, PinOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocaleContext } from "@/context/LocaleContext";
import { WelcomeLocaleFlag } from "@/components/welcome/WelcomeLocaleFlag";
import { WelcomeThemeToggle, type WelcomeTheme } from "@/components/welcome/WelcomeThemeToggle";
import { welcomeCopyForLocale } from "@/lib/locale/welcomeCopy";
import {
  WELCOME_LANGUAGE_OPTIONS,
  welcomeToolbarCode,
  type WelcomeLanguageOption,
} from "@/lib/locale/welcomeLanguageOptions";
import type { ToolbarControlsLayout } from "@/lib/welcomeStudio";
import { WELCOME_SCENE_STEP_EVENT } from "@/lib/welcomeSceneWheel";

const AUTO_MS = 3000;
const ROW_H = 44;

type WelcomeLocaleRailProps = {
  isLight?: boolean;
  theme: WelcomeTheme;
  onThemeChange: (theme: WelcomeTheme) => void;
  layout?: ToolbarControlsLayout;
  /** Show dark rounded track behind the scroll rail (studio toggle) */
  showLocaleRailBg?: boolean;
};

export function WelcomeLocaleRail({
  isLight = false,
  theme,
  onThemeChange,
  layout,
  showLocaleRailBg = true,
}: WelcomeLocaleRailProps) {
  const toolbar = layout;
  const [utilityOpen, setUtilityOpen] = useState(true);
  const { locale, setLocale, localePinned, setLocalePinned } = useLocaleContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pauseAutoRef = useRef(false);
  const userScrollRef = useRef(false);
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHold = () => {
    if (holdRef.current) {
      clearTimeout(holdRef.current);
      holdRef.current = null;
    }
  };

  const bindHoldAction = (action: () => void) => ({
    onPointerDown: () => {
      clearHold();
      holdRef.current = setTimeout(action, 420);
    },
    onPointerUp: clearHold,
    onPointerLeave: clearHold,
    onPointerCancel: clearHold,
    onClick: () => {
      clearHold();
      setUtilityOpen(false);
    },
  });

  const activeIndex = Math.max(
    0,
    WELCOME_LANGUAGE_OPTIONS.findIndex((o) => o.locale === locale),
  );
  const pinCopy = welcomeCopyForLocale(locale);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = ((index % WELCOME_LANGUAGE_OPTIONS.length) + WELCOME_LANGUAGE_OPTIONS.length) %
      WELCOME_LANGUAGE_OPTIONS.length;
    el.scrollTo({ top: clamped * ROW_H, behavior });
  }, []);

  const selectOption = useCallback(
    (option: WelcomeLanguageOption, behavior: ScrollBehavior = "smooth") => {
      const idx = WELCOME_LANGUAGE_OPTIONS.indexOf(option);
      if (idx < 0) return;
      setLocale(option.locale);
      scrollToIndex(idx, behavior);
    },
    [setLocale, scrollToIndex],
  );

  useEffect(() => {
    if (userScrollRef.current) return;
    scrollToIndex(activeIndex, "auto");
  }, [activeIndex, scrollToIndex]);

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
    }, AUTO_MS);

    return () => window.clearInterval(id);
  }, [activeIndex, localePinned, selectOption]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    userScrollRef.current = true;
    const idx = Math.round(el.scrollTop / ROW_H);
    const clamped = Math.min(Math.max(idx, 0), WELCOME_LANGUAGE_OPTIONS.length - 1);
    const option = WELCOME_LANGUAGE_OPTIONS[clamped];
    if (option.locale !== locale) setLocale(option.locale);
    window.setTimeout(() => {
      userScrollRef.current = false;
    }, 120);
  };

  const railStyle = toolbar
    ? {
        right: `${toolbar.railRightRem}rem`,
        top: `${toolbar.railTopPct}%`,
        transform: "translateY(-50%)",
      }
    : undefined;

  return (
    <aside
      className={cn(
        "pointer-events-none fixed z-40 flex flex-col items-end",
        !toolbar && "right-3 top-1/2 -translate-y-1/2 gap-2 sm:right-4",
      )}
      style={
        toolbar
          ? { ...railStyle, gap: toolbar.controlsGapPx }
          : railStyle
      }
      aria-label="Language"
    >
      <div
        className="pointer-events-auto flex flex-col items-end"
        style={toolbar ? { gap: toolbar.railDotsGapPx } : undefined}
      >
        <div
          ref={scrollRef}
          style={{ height: ROW_H }}
          className={cn(
            "snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            showLocaleRailBg &&
              cn(
                "rounded-full px-1",
                isLight ? "border border-black/15 bg-white/90" : "border border-white/15 bg-[#141414]/90",
              ),
          )}
          role="listbox"
          aria-label="Region & language"
          onScroll={onScroll}
          onPointerEnter={() => {
            pauseAutoRef.current = true;
          }}
          onPointerLeave={() => {
            pauseAutoRef.current = false;
          }}
          onFocus={() => {
            pauseAutoRef.current = true;
          }}
          onBlur={() => {
            pauseAutoRef.current = false;
          }}
        >
          {WELCOME_LANGUAGE_OPTIONS.map((option, i) => {
            const isActive = i === activeIndex;
            return (
              <div
                key={option.code}
                className="flex h-[44px] w-full shrink-0 snap-center snap-always items-center justify-end gap-2 pr-0.5"
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  title={option.title}
                  aria-label={`${option.code} — ${option.title}`}
                  onClick={() => selectOption(option)}
                  className={cn(
                    "flex min-w-0 items-center gap-2 overflow-hidden text-left transition-[max-width,opacity,transform] duration-300 ease-out",
                    isActive ? "max-w-[5.5rem] opacity-100" : "max-w-0 opacity-0 pointer-events-none",
                  )}
                >
                  <WelcomeLocaleFlag code={option.code} className="h-3 w-4 shrink-0" />
                  <span
                    className={cn(
                      "shrink-0 text-sm font-bold tracking-wide",
                      isLight ? "text-black" : "text-white",
                    )}
                  >
                    {option.code}
                  </span>
                </button>
                <button
                  type="button"
                  aria-hidden={!isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => selectOption(option)}
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full transition-all duration-300",
                    isActive
                      ? "scale-125 bg-[#f5c518] shadow-[0_0_0_1px_rgba(245,197,24,0.35)]"
                      : isLight
                        ? "bg-black/25 hover:bg-black/40"
                        : "bg-white/25 hover:bg-white/50",
                  )}
                />
              </div>
            );
          })}
        </div>
        <p className="sr-only" aria-live="polite">
          {welcomeToolbarCode(locale)}
        </p>
      </div>

      {utilityOpen ? (
        <div
          className="pointer-events-auto flex flex-col items-end"
          style={
            toolbar
              ? {
                  marginTop: toolbar.controlsOffsetYPx,
                  marginRight: `${toolbar.controlsOffsetXRem}rem`,
                  gap: toolbar.controlsButtonGapPx,
                }
              : { gap: 6 }
          }
        >
          <button
            type="button"
            {...bindHoldAction(() => setLocalePinned(!localePinned))}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border transition",
              isLight
                ? localePinned
                  ? "border-black/25 bg-black/10 text-black"
                  : "border-black/15 text-black/40 hover:bg-black/5"
                : localePinned
                  ? "border-white/35 bg-white/15 text-white"
                  : "border-white/20 text-white/45 hover:bg-white/10",
            )}
            aria-pressed={localePinned}
            aria-label={localePinned ? pinCopy.unpinLabel : pinCopy.pinLabel}
            title={`${localePinned ? pinCopy.unpinLabel : pinCopy.pinLabel} · tap to hide · hold to pin`}
          >
            {localePinned ? (
              <Pin className="h-3.5 w-3.5" strokeWidth={1.75} />
            ) : (
              <PinOff className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
          </button>
          <div
            {...bindHoldAction(() => onThemeChange(isLight ? "dark" : "light"))}
            title="Tap to hide · hold to switch theme"
          >
            <WelcomeThemeToggle
              theme={theme}
              onThemeChange={() => {}}
              compact
              className="pointer-events-none"
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setUtilityOpen(true)}
          className={cn(
            "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border transition",
            isLight
              ? "border-black/15 text-black/50 hover:bg-black/5"
              : "border-white/20 text-white/45 hover:bg-white/10",
          )}
          aria-label="Show pin and theme controls"
          title="Show controls"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
        </button>
      )}
    </aside>
  );
}
