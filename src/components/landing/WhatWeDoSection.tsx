import { useEffect, useState, type CSSProperties } from "react";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { FeatureCard } from "@/components/framer/FeatureCard";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type OfferingCard = {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
};

type Region = "ghana" | "global";

const REGION_KEY = "beiza-legacy-region-v2";

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

/** Ghana mode — Twi-forward, culturally native craft (not generic DB funeral offerings). */
const GHANA_OFFERINGS: OfferingCard[] = [
  {
    id: "ghana-nsɛm",
    title: "Nsɛm a Wɔde Sie — Voice Vault",
    description: "Record stories in Twi, Ga, or English. Every voice kept for grandchildren here and abroad.",
  },
  {
    id: "ghana-adwuma",
    title: "Adwuma — Legacy Production",
    description: "Handcrafted celebrations rooted in Ghanaian ritual — imagery, stage, and keepsakes your family will honour.",
  },
  {
    id: "ghana-abusua",
    title: "Abusua Koro — Family Circles",
    description: "Invite relatives with secure codes. Elders, children, and diaspora kin in one private circle.",
  },
  {
    id: "ghana-soro",
    title: "Soro Ne Akyiri — Live & Replay",
    description: "Stream homegoing and naming gatherings; HD replays for family who cannot travel to Accra or Kumasi.",
  },
];

type WhatWeDoSectionProps = {
  offerings: OfferingCard[];
  mockupSrc?: string | null;
  className?: string;
  style?: CSSProperties;
};

export function WhatWeDoSection({ offerings, mockupSrc, className, style }: WhatWeDoSectionProps) {
  const [region, setRegion] = useState<Region>("global");
  const [mockupFailed, setMockupFailed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(REGION_KEY);
    if (saved === "ghana" || saved === "global") setRegion(saved);
  }, []);

  const setRegionAndSave = (next: Region) => {
    setRegion(next);
    localStorage.setItem(REGION_KEY, next);
  };

  const isGlobal = region === "global";
  const visibleOfferings = isGlobal
    ? offerings.length <= 1
      ? GLOBAL_OFFERINGS
      : offerings
    : GHANA_OFFERINGS;

  return (
    <section
      className={cn("studio-offerings mx-auto w-full max-w-6xl px-[5%] py-24 lg:py-32", className)}
      style={style}
    >
      <SectionHeader
        eyebrow="What We Do"
        title="How We Preserve Your Legacy"
        description={
          isGlobal
            ? "Open to families everywhere — recorded voices, curated imagery, and cultural keepsakes your people can access from any country."
            : "Ɛyɛ abusua adwuma — Twi, Ga, and English voices, curated imagery, and keepsakes crafted for generations in Ghana and the diaspora."
        }
        align="center"
      />

      <div className="mt-8 flex justify-center">
        <RegionToggle region={region} onChange={setRegionAndSave} />
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

function RegionToggle({
  region,
  onChange,
}: {
  region: Region;
  onChange: (r: Region) => void;
}) {
  return (
    <div
      className="inline-flex rounded-full border border-white/15 bg-black/40 p-1"
      role="group"
      aria-label="Service region"
    >
      <button
        type="button"
        onClick={() => onChange("ghana")}
        className={cn(
          "rounded-full px-5 py-2 text-sm font-medium transition-colors",
          region === "ghana"
            ? "bg-primary text-primary-foreground"
            : "text-subtle hover:text-white",
        )}
        aria-pressed={region === "ghana"}
      >
        Ghana
        <span className="ml-1.5 hidden text-xs font-normal opacity-80 sm:inline">· Twi native</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("global")}
        className={cn(
          "rounded-full px-5 py-2 text-sm font-medium transition-colors",
          region === "global"
            ? "bg-primary text-primary-foreground"
            : "text-subtle hover:text-white",
        )}
        aria-pressed={region === "global"}
      >
        Global
      </button>
    </div>
  );
}
