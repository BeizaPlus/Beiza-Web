import { useEffect, useState, type CSSProperties } from "react";
import { Globe, MapPin } from "lucide-react";
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

const REGION_KEY = "beiza-legacy-region";

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

type WhatWeDoSectionProps = {
  offerings: OfferingCard[];
  mockupSrc?: string | null;
  className?: string;
  style?: CSSProperties;
};

export function WhatWeDoSection({ offerings, mockupSrc, className, style }: WhatWeDoSectionProps) {
  const [region, setRegion] = useState<Region>("ghana");
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
  const visibleOfferings = isGlobal && offerings.length <= 1 ? GLOBAL_OFFERINGS : offerings;

  return (
    <section
      className={cn("studio-offerings mx-auto max-w-6xl px-6 py-24 lg:py-32", className)}
      style={style}
    >
      <SectionHeader
        eyebrow="What We Do"
        title="How We Preserve Your Legacy"
        description={
          isGlobal
            ? "Open to families everywhere — recorded voices, curated imagery, and cultural keepsakes your people can access from any country."
            : "Every story is handcrafted — recorded voices, curated imagery, and cultural keepsakes your family will carry for generations."
        }
        align="center"
      />

      <div className="mt-8 flex justify-center">
        <RegionToggle region={region} onChange={setRegionAndSave} />
      </div>

      <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-subtle">
        {isGlobal ? (
          <>
            <Globe className="mr-1.5 inline h-4 w-4 align-text-bottom text-primary" aria-hidden />
            Global mode — Beiza Legacy is open to the entire world. Families outside Ghana can create
            circles, record, and vault without limits on location.
          </>
        ) : (
          <>
            <MapPin className="mr-1.5 inline h-4 w-4 align-text-bottom text-primary" aria-hidden />
            Ghana — our production home. Deep cultural craft for families here; switch to Global when
            your circle spans continents.
          </>
        )}
      </p>

      <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:gap-10">
        <div className="grid gap-6 sm:grid-cols-2">
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
          className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/25 bg-white/[0.03] lg:min-h-[420px] lg:sticky lg:top-28"
          aria-label="Product mockup placeholder"
        >
          {mockupSrc && !mockupFailed ? (
            <img
              src={mockupSrc}
              alt="Beiza Legacy product preview"
              className="h-full w-full object-cover object-top"
              onError={() => setMockupFailed(true)}
            />
          ) : (
            <div className="px-6 text-center">
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
