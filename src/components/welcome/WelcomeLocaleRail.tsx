import { useCallback, useEffect, useRef } from "react";
import { Pin, PinOff } from "lucide-react";
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

const AUTO_MS = 3000;
const PILL_H = 44;

type WelcomeLocaleRailProps = {
  isLight?: boolean;
  theme: WelcomeTheme;
  onThemeChange: (theme: WelcomeTheme) => void;
  layout?: ToolbarControlsLayout;
};

export function WelcomeLocaleRail({
  isLight = false,
  theme,
  onThemeChange,
  layout,
}: WelcomeLocaleRailProps) {
  const toolbar = layout;
  const { locale, setLocale, localePinned, setLocalePinned } = useLocaleContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pauseAutoRef = useRef(false);
  const userScrollRef = useRef(false);

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
    const top = clamped * PILL_H;
    el.scrollTo({ top, behavior });
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
    const idx = Math.round(el.scrollTop / PILL_H);
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
        "pointer-events-none fixed z-40 flex flex-col items-center",
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
        className="pointer-events-auto flex items-center"
        style={toolbar ? { gap: toolbar.railDotsGapPx } : { gap: 8 }}
      >
        <div
          ref={scrollRef}
          style={{ height: PILL_H }}
          className={cn(
            "snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "rounded-full border",
            isLight ? "border-black/15 bg-white/90" : "border-white/15 bg-[#141414]/90",
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
          {WELCOME_LANGUAGE_OPTIONS.map((option) => {
            const isActive = welcomeToolbarCode(locale) === option.code;
            return (
              <button
                key={option.code}
                type="button"
                role="option"
                aria-selected={isActive}
                title={option.title}
                aria-label={`${option.code} — ${option.title}`}
                onClick={() => selectOption(option)}
                className={cn(
                  "flex h-[44px] w-[52px] shrink-0 snap-start snap-always flex-col items-center justify-center gap-0.5 rounded-full font-semibold transition sm:w-[56px]",
                  isActive
                    ? "bg-[#f5c518] text-black shadow-sm"
                    : isLight
                      ? "text-black/55 hover:bg-black/5"
                      : "text-white/55 hover:bg-white/8",
                )}
              >
                <WelcomeLocaleFlag code={option.code} className="h-3 w-4" />
                <span className="text-[10px] tracking-wide">{option.code}</span>
              </button>
            );
          })}
        </div>

        <nav className="flex flex-col gap-2 py-1" aria-label="Language position">
          {WELCOME_LANGUAGE_OPTIONS.map((option, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={option.code}
                type="button"
                aria-label={`Go to ${option.code}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => selectOption(option)}
                className={cn(
                  "h-2 w-2 rounded-full transition",
                  isActive
                    ? "scale-125 bg-[#f5c518]"
                    : isLight
                      ? "bg-black/25 hover:bg-black/40"
                      : "bg-white/25 hover:bg-white/50",
                )}
              />
            );
          })}
        </nav>
      </div>

      <div
        className="pointer-events-auto flex flex-col"
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
          onClick={() => setLocalePinned(!localePinned)}
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
          title={localePinned ? pinCopy.unpinLabel : pinCopy.pinLabel}
        >
          {localePinned ? (
            <Pin className="h-3.5 w-3.5" strokeWidth={1.75} />
          ) : (
            <PinOff className="h-3.5 w-3.5" strokeWidth={1.75} />
          )}
        </button>
        <WelcomeThemeToggle theme={theme} onThemeChange={onThemeChange} compact />
      </div>

    </aside>
  );
}
