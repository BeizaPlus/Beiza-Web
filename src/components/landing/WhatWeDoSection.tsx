import { useEffect, useState, type CSSProperties } from "react";
import { FlagIcon } from "@/components/ui/FlagIcon";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { FeatureCard } from "@/components/framer/FeatureCard";
import { RecordStationCuriosityLoop } from "@/components/landing/RecordStationCuriosityLoop";
import {
  marketingSection,
  segmentToggleOption,
  segmentToggleShell,
  siteBoundedContainer,
  siteBounds,
} from "@/lib/brandUi";
import { LAYOUT_TW } from "@/lib/layoutBreakpoints";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type OfferingCard = {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
};

export type LegacyLocale = "global" | "ghana" | "spanish" | "french";

const LOCALE_KEY = "beiza-legacy-locale-v3";

const LOCALE_OPTIONS: { id: LegacyLocale; flagKey: string; label: string }[] = [
  { id: "global", flagKey: "GLOBAL", label: "Global" },
  { id: "ghana", flagKey: "GH", label: "Ghana · Twi" },
  { id: "spanish", flagKey: "ES", label: "Spanish" },
  { id: "french", flagKey: "FR", label: "French" },
];

const LOCALE_COPY: Record<
  LegacyLocale,
  { description: string; secondary?: string }
> = {
  global: {
    description:
      "Record voices at the station, store them in your vault, and share your circle — from any country.",
  },
  ghana: {
    description:
      "Mmienu ne mmienu — fa wo fifo asem sie wɔ Beiza mu. Record at the station, keep voices in your vault.",
    secondary:
      "Your family's story belongs here. Record it in Twi — your children will hear it forever.",
  },
  spanish: {
    description:
      "Graba en la estación, guarda en tu bóveda, e invita a tu círculo — desde cualquier país.",
    secondary: "Your family's story, preserved in Spanish.",
  },
  french: {
    description:
      "Enregistrez à la station, conservez dans votre coffre, invitez votre cercle — partout dans le monde.",
    secondary: "Your family's story, preserved in French.",
  },
};

function isLegacyLocale(value: string | null): value is LegacyLocale {
  return value === "global" || value === "ghana" || value === "spanish" || value === "french";
}

/** Marketing offering — not shown on education home. */
function isLegacyGalleriesOffering(item: OfferingCard): boolean {
  return (
    item.id === "fallback-offering-galleries" ||
    item.title.trim().toLowerCase() === "legacy galleries"
  );
}

type WhatWeDoSectionProps = {
  offerings: OfferingCard[];
  mockupSrc?: string | null;
  className?: string;
  style?: CSSProperties;
  id?: string;
  showLocaleToggle?: boolean;
  /** Education `/home` — single curiosity loop, no card grid. */
  variant?: "default" | "educationSimple";
};

export function WhatWeDoSection({
  offerings,
  mockupSrc,
  className,
  style,
  id,
  showLocaleToggle = true,
  variant = "default",
}: WhatWeDoSectionProps) {
  const [locale, setLocale] = useState<LegacyLocale>("global");
  const [mockupFailed, setMockupFailed] = useState(false);
  const localeScrollRef = useDraggableScroll();
  const educationSimple = variant === "educationSimple";

  useEffect(() => {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (isLegacyLocale(saved)) setLocale(saved);
  }, []);

  const setLocaleAndSave = (next: LegacyLocale) => {
    setLocale(next);
    localStorage.setItem(LOCALE_KEY, next);
  };

  const copy = LOCALE_COPY[locale];

  return (
    <section
      id={id}
      className={cn("studio-offerings scroll-mt-24", marketingSection, siteBounds, className)}
      style={style}
    >
      <div className={siteBoundedContainer}>
        <SectionHeader
          eyebrow="What We Do"
          title="How We Preserve Your Legacy"
          align="center"
        />

        {showLocaleToggle && !educationSimple ? (
          <div
            ref={localeScrollRef}
            data-draggable
            className="mt-8 flex justify-center overflow-x-auto px-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <LocaleToggle locale={locale} onChange={setLocaleAndSave} />
          </div>
        ) : null}

        <div className={cn("mx-auto max-w-2xl px-2 text-center", educationSimple ? "mt-6" : "mt-6")}>
          <p className="text-base leading-relaxed text-subtle">{copy.description}</p>
          {copy.secondary && !educationSimple ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy.secondary}</p>
          ) : null}
        </div>

        {educationSimple ? (
          <div className="mx-auto mt-10 w-full max-w-4xl">
            <RecordStationCuriosityLoop />
          </div>
        ) : (
          <div
            className={cn(
              "mt-12 grid w-full grid-cols-1 gap-6",
              "min-[768px]:grid-cols-[58%_38%] min-[768px]:items-stretch min-[768px]:gap-[4%]",
            )}
          >
            <div
              className={cn(
                "grid w-full grid-cols-1 gap-[4%] sm:auto-rows-fr",
                "min-[768px]:grid-cols-2",
              )}
            >
              {offerings
                .filter((feature) => !isLegacyGalleriesOffering(feature))
                .map((feature) => (
                  <FeatureCard
                    key={feature.id}
                    title={feature.title}
                    description={feature.description ?? ""}
                    icon={feature.icon}
                  />
                ))}
            </div>

            <div
              className={cn(
                "relative min-h-[20rem] w-full overflow-hidden rounded-lg border border-white/10 sm:min-h-[24rem]",
                "min-[768px]:min-h-0 min-[768px]:h-full",
              )}
              aria-label="Product preview"
            >
              {mockupSrc && !mockupFailed ? (
                <img
                  src={mockupSrc}
                  alt="Beiza Legacy product preview"
                  className="absolute inset-0 h-full w-full object-cover object-top"
                  onError={() => setMockupFailed(true)}
                />
              ) : (
                <RecordStationCuriosityLoop className="absolute inset-0 h-full rounded-lg border-0" />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function LocaleToggle({
  locale,
  onChange,
}: {
  locale: LegacyLocale;
  onChange: (next: LegacyLocale) => void;
}) {
  return (
    <div
      className={cn(segmentToggleShell, "sm:flex-wrap sm:justify-center")}
      role="group"
      aria-label="Language and region"
    >
      {LOCALE_OPTIONS.map(({ id, flagKey, label }) => {
        const active = locale === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(segmentToggleOption(active), "inline-flex items-center gap-2")}
            aria-pressed={active}
          >
            <FlagIcon country={flagKey} size={18} className="shrink-0" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
