import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";

export type PricingTierContent = {
  id: string;
  name: string;
  price: string;
  tagline: string;
  badge?: string;
  description: string;
  features: string[];
  lockedFeatures?: string[];
  cta: string;
  note?: string;
  whiteSwan?: { title: string; body: string };
};

export type PricingSectionContent = {
  eyebrow: string;
  title: string;
  description: string;
  tiers: PricingTierContent[];
};

export const DEFAULT_PRICING_CONTENT: PricingSectionContent = {
  eyebrow: "Legacy Curation",
  title: "Start free. Grow your family's archive.",
  description:
    "Preserve voices and stories in your vault — upgrade when you're ready for deeper curation.",
  tiers: [
    {
      id: "circle",
      name: "Circle",
      price: "$0",
      tagline: "Start preserving",
      description:
        "Record voices, rename memories, store in your vault, and invite family to contribute.",
      features: [
        "Unlimited voice recordings (no duration cap)",
        "Rename your memories",
        "Share memories via link",
        "1 Legacy Circle + family invite codes",
        "5 GB shared vault storage",
      ],
      lockedFeatures: ["Cannot delete recordings", "No raw audio downloads"],
      cta: "Start free →",
    },
    {
      id: "keeper",
      name: "Keeper",
      price: "$4.99",
      tagline: "Per month",
      badge: "Most popular",
      description:
        "For families ready to protect, share, and shape their legacy into something lasting.",
      features: [
        "Everything in Circle",
        "Delete & manage recordings",
        "Download recordings as audio files",
        "Story cards from photos → family notifications",
        "500 MB vault storage",
      ],
      cta: "Upgrade to Keeper →",
      note: "Storage upgrade to 50 GB available · $19.99/mo",
    },
    {
      id: "heritage",
      name: "Heritage",
      price: "$200",
      tagline: "White-glove",
      description:
        "Full legacy curation — produced films, printed keepsakes, and cross-border family coordination.",
      whiteSwan: {
        title: "White Swan — included after 1 year",
        body: "When a family member passes, Beiza coordinates their memorial experience — photography, tribute film, and family gathering. Valued at $950. Yours at no extra cost after 12 months subscribed.",
      },
      features: [
        "Everything in Keeper",
        "Cinematic tribute films",
        "Heirloom books & physical galleries",
        "Cross-border family coordination",
        "Dedicated legacy producer",
        "Unlimited vault storage",
      ],
      cta: "Plan with us →",
      note: "White Swan also available standalone · $950",
    },
  ],
};

export function mergePricingContent(
  partial?: Partial<PricingSectionContent>,
): PricingSectionContent {
  if (!partial) return DEFAULT_PRICING_CONTENT;
  const tiers =
    partial.tiers?.map((tier, i) => ({
      ...DEFAULT_PRICING_CONTENT.tiers[i],
      ...DEFAULT_PRICING_CONTENT.tiers.find((t) => t.id === tier.id),
      ...tier,
      features: tier.features ?? DEFAULT_PRICING_CONTENT.tiers.find((t) => t.id === tier.id)?.features ?? [],
      lockedFeatures:
        tier.lockedFeatures ??
        DEFAULT_PRICING_CONTENT.tiers.find((t) => t.id === tier.id)?.lockedFeatures,
    })) ?? DEFAULT_PRICING_CONTENT.tiers;

  return {
    ...DEFAULT_PRICING_CONTENT,
    ...partial,
    tiers: tiers.length >= 3 ? tiers : DEFAULT_PRICING_CONTENT.tiers,
  };
}

export const TIER_HREFS: Record<string, string> = {
  circle: BEIZA_LINKS.legacy.family,
  keeper: BEIZA_LINKS.marketing.pricing,
  heritage: BEIZA_LINKS.farewell.heritage,
};

export function tierFlags(tierId: string) {
  return {
    featured: tierId === "circle",
    popular: tierId === "keeper",
  };
}
