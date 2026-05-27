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
    <section className="mx-auto mt-8 w-full max-w-6xl px-6 md:mt-10">
      <div
        ref={localeScrollRef}
        data-draggable
        className="flex justify-center overflow-x-auto px-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className={cn(segmentToggleShell, "sm:flex-wrap sm:justify-center")} role="group" aria-label="Language and region">
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
    </section>
  );
}

