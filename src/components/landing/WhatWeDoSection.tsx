import { useEffect, useState, type CSSProperties } from "react";
import { FlagIcon } from "@/components/ui/FlagIcon";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { FeatureCard } from "@/components/framer/FeatureCard";
import { marketingContainer, marketingSection, segmentToggleOption, segmentToggleShell } from "@/lib/brandUi";
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

const GLOBAL_OFFERINGS: OfferingCard[] = [
  {
    id: "global-galleries",
    title: "Legacy Galleries",
    description: "Curated imagery of the people you love — shared with family anywhere.",
  },
  {
    id: "global-vault",
    title: "Voice Vault",
    description: "Record and replay stories in your family's private archive, from any country.",
  },
  {
    id: "global-circle",
    title: "Family Circles",
    description: "Invite relatives across borders with secure codes and role-based access.",
  },
  {
    id: "global-stream",
    title: "Live & Replay",
    description: "Stream gatherings and keep HD replays for relatives who cannot travel.",
  },
];

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
      "Open to families everywhere — recorded voices, curated imagery, and cultural keepsakes your people can access from any country.",
  },
  ghana: {
    description:
      "Mmienu ne mmienu — wo fifo asem wɔ hɔ. Fa wo ni ase ho asem sie wɔ Beiza mu ná wo mma nso nna ho.",
    secondary:
      "Your family's story belongs here. Record it in Twi — your children will hear it forever.",
  },
  spanish: {
    description:
      "Para familias de todo el mundo — guarda las voces, las historias y el legado de los tuyos, desde cualquier país.",
    secondary: "Your family's story, preserved in Spanish.",
  },
  french: {
    description:
      "Pour les familles partout dans le monde — préservez les voix, les histoires et l'héritage des vôtres, depuis n'importe quel pays.",
    secondary: "Your family's story, preserved in French.",
  },
};

function isLegacyLocale(value: string | null): value is LegacyLocale {
  return value === "global" || value === "ghana" || value === "spanish" || value === "french";
}

type WhatWeDoSectionProps = {
  offerings: OfferingCard[];
  mockupSrc?: string | null;
  className?: string;
  style?: CSSProperties;
};

export function WhatWeDoSection({ offerings, mockupSrc, className, style }: WhatWeDoSectionProps) {
  const [locale, setLocale] = useState<LegacyLocale>("global");
  const [mockupFailed, setMockupFailed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (isLegacyLocale(saved)) setLocale(saved);
  }, []);

  const setLocaleAndSave = (next: LegacyLocale) => {
    setLocale(next);
    localStorage.setItem(LOCALE_KEY, next);
  };

  const visibleOfferings = offerings.length <= 1 ? GLOBAL_OFFERINGS : offerings;
  const copy = LOCALE_COPY[locale];

  return (
    <section
      className={cn("studio-offerings", marketingSection, marketingContainer, className)}
      style={style}
    >
      <SectionHeader
        eyebrow="What We Do"
        title="How We Preserve Your Legacy"
        align="center"
      />

      <div className="mt-8 flex justify-center overflow-x-auto px-1 pb-1">
        <LocaleToggle locale={locale} onChange={setLocaleAndSave} />
      </div>

      <div className="mx-auto mt-6 max-w-2xl px-2 text-center">
        <p className="text-base leading-relaxed text-subtle">{copy.description}</p>
        {copy.secondary ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy.secondary}</p>
        ) : null}
      </div>

      <div className="mt-12 grid w-full grid-cols-1 gap-6 lg:grid-cols-[58%_38%] lg:items-stretch lg:gap-[4%]">
        <div className="grid w-full grid-cols-1 gap-[4%] sm:grid-cols-2 sm:auto-rows-fr">
          {visibleOfferings.map((feature) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description ?? ""}
              icon={feature.icon}
            />
          ))}
        </div>

        <div
          className="relative min-h-[20rem] w-full overflow-hidden rounded-lg border border-white/10 sm:min-h-[24rem] lg:min-h-0 lg:h-full"
          aria-label="Product mockup placeholder"
        >
          {mockupSrc && !mockupFailed ? (
            <img
              src={mockupSrc}
              alt="Beiza Legacy product preview"
              className="absolute inset-0 h-full w-full object-cover object-top"
              onError={() => setMockupFailed(true)}
            />
          ) : (
            <div className="flex h-full min-h-[inherit] items-center justify-center bg-white/[0.03] px-[6%] py-12 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Mockup
              </p>
              <p className="mt-2 text-sm text-subtle">
                Drop your Legacy app or gallery preview image here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">public/images/legacy-mockup.png</p>
            </div>
          )}
        </div>
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
