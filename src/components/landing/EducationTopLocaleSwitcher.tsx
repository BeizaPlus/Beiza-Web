import { FlagIcon } from "@/components/ui/FlagIcon";
import { segmentToggleOption, segmentToggleShell, sitePaddingX } from "@/lib/brandUi";
import { cn } from "@/lib/utils";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { useLocaleContext } from "@/context/LocaleContext";
import type { BeizaLocale } from "@/lib/locale/types";

type LegacyLocale = "global" | "ghana" | "spanish" | "french";

const LOCALE_OPTIONS: { id: LegacyLocale; flagKey: string; label: string }[] = [
  { id: "global", flagKey: "GLOBAL", label: "Global" },
  { id: "ghana", flagKey: "GH", label: "Ghana · Twi" },
  { id: "spanish", flagKey: "ES", label: "Spanish" },
  { id: "french", flagKey: "FR", label: "French" },
];

const LOCALE_MAP: Record<LegacyLocale, BeizaLocale> = {
  global: "black-american",
  ghana: "africa",
  spanish: "latina",
  french: "fr",
};

type EducationTopLocaleSwitcherProps = {
  /** `hero` — floating glass pill, bottom-right inside cinematic hero */
  variant?: "inline" | "hero";
};

export function EducationTopLocaleSwitcher({ variant = "inline" }: EducationTopLocaleSwitcherProps) {
  const { locale, setLocale, setLocalePinned } = useLocaleContext();
  const localeScrollRef = useDraggableScroll();
  const activeLegacy: LegacyLocale =
    locale === "africa" ? "ghana" : locale === "latina" ? "spanish" : locale === "fr" ? "french" : "global";

  const pillGroup = (
    <div
      ref={localeScrollRef}
      data-draggable
      className="flex overflow-x-auto px-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div
        className={cn(
          segmentToggleShell,
          "border-white/15 bg-black/45 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.65)] backdrop-blur-md",
          "sm:flex-wrap",
          "gap-1.5 p-1.5",
        )}
        role="group"
        aria-label="Language and region"
      >
            {LOCALE_OPTIONS.map(({ id, flagKey, label }) => {
              const active = activeLegacy === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setLocale(LOCALE_MAP[id]);
                    setLocalePinned(true);
                  }}
                  className={cn(
                    segmentToggleOption(active),
                    "inline-flex items-center gap-2 px-6 py-3 text-sm sm:text-base",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  )}
                  aria-pressed={active}
                >
                  <FlagIcon country={flagKey} size={22} className="shrink-0" />
                  {label}
                </button>
              );
            })}
      </div>
    </div>
  );

  if (variant === "hero") {
    return (
      <div
        id="locale-rail"
        className="studio-locale-rail pointer-events-none absolute right-12 z-20 max-[767px]:right-6"
        style={{
          bottom: "calc(2rem + var(--locale-rail-viewport-y, 0) * 1vh)",
        }}
      >
        <div className="pointer-events-auto w-max max-w-[min(100vw-3rem,42rem)]">{pillGroup}</div>
      </div>
    );
  }

  return (
    <section
      id="locale-rail"
      className={cn(
        "studio-locale-rail relative z-20 w-full min-h-[3.25rem]",
        sitePaddingX,
      )}
      style={{
        marginTop: "calc(-3rem + var(--locale-rail-viewport-y, 0) * 1vh)",
      }}
    >
      <div
        className="flex w-full justify-center"
        style={{
          transform: `translateX(calc((var(--locale-rail-viewport-x, 50) - 50) * 0.6vw))`,
        }}
      >
        <div className="w-max max-w-[min(100%,calc(100vw-2*var(--beiza-site-padding-x,1.25rem)-11rem))]">
          {pillGroup}
        </div>
      </div>
    </section>
  );
}
