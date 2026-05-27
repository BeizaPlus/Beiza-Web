import { useEffect, useState } from "react";
import { FlagIcon } from "@/components/ui/FlagIcon";
import { segmentToggleOption, segmentToggleShell } from "@/lib/brandUi";
import { cn } from "@/lib/utils";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";

type LegacyLocale = "global" | "ghana" | "spanish" | "french";

const LOCALE_KEY = "beiza-legacy-locale-v3";

const LOCALE_OPTIONS: { id: LegacyLocale; flagKey: string; label: string }[] = [
  { id: "global", flagKey: "GLOBAL", label: "Global" },
  { id: "ghana", flagKey: "GH", label: "Ghana · Twi" },
  { id: "spanish", flagKey: "ES", label: "Spanish" },
  { id: "french", flagKey: "FR", label: "French" },
];

function isLegacyLocale(value: string | null): value is LegacyLocale {
  return value === "global" || value === "ghana" || value === "spanish" || value === "french";
}

export function EducationTopLocaleSwitcher() {
  const [locale, setLocale] = useState<LegacyLocale>("global");
  const localeScrollRef = useDraggableScroll();

  useEffect(() => {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (isLegacyLocale(saved)) setLocale(saved);
  }, []);

  const setLocaleAndSave = (next: LegacyLocale) => {
    setLocale(next);
    localStorage.setItem(LOCALE_KEY, next);
  };

  return (
    <section
      id="locale-rail"
      className="studio-locale-rail relative z-10 w-full min-h-[3.25rem]"
      style={{
        marginTop: "calc(2rem + var(--locale-rail-viewport-y, 0) * 1vh)",
      }}
    >
      <div
        className="absolute top-0 z-10 w-max max-w-[min(100%,calc(100vw-2*var(--beiza-site-padding-x,1.25rem)))]"
        style={{
          left: "calc(var(--locale-rail-viewport-x, 50) * 1vw)",
          transform: "translateX(-50%)",
        }}
      >
        <div
          ref={localeScrollRef}
          data-draggable
          className="flex overflow-x-auto px-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div
            className={cn(segmentToggleShell, "sm:flex-wrap")}
            role="group"
            aria-label="Language and region"
          >
            {LOCALE_OPTIONS.map(({ id, flagKey, label }) => {
              const active = locale === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLocaleAndSave(id)}
                  className={cn(segmentToggleOption(active), "inline-flex items-center gap-2")}
                  aria-pressed={active}
                >
                  <FlagIcon country={flagKey} size={18} className="shrink-0" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
