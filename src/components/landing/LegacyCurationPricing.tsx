import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { CasketIcon } from "@/components/icons/CasketIcon";
import { cn } from "@/lib/utils";

const GOLD = "#E6A817";

type Tier = {
  id: string;
  name: string;
  price: string;
  tagline: string;
  badge?: string;
  description: string;
  features: string[];
  lockedFeatures?: string[];
  cta: string;
  href: string;
  featured?: boolean;
  popular?: boolean;
  note?: string;
  whiteSwan?: { title: string; body: string };
};

const TIERS: Tier[] = [
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
      "1 Legacy Circle + family invite codes",
      "5 GB shared vault storage",
    ],
    lockedFeatures: ["Cannot delete recordings", "No downloads or sharing"],
    cta: "Start free →",
    href: "/legacy/family",
    featured: true,
  },
  {
    id: "keeper",
    name: "Keeper",
    price: "$4.99",
    tagline: "Per month",
    badge: "Most popular",
    popular: true,
    description:
      "For families ready to protect, share, and shape their legacy into something lasting.",
    features: [
      "Everything in Circle",
      "Delete & manage recordings",
      "Share recordings (fragment-protected on download)",
      "Story cards from photos → family notifications",
      "500 MB vault storage",
    ],
    cta: "Upgrade to Keeper →",
    href: "/pricing",
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
    href: "/heritage",
    note: "White Swan also available standalone · $950",
  },
];

export function LegacyCurationPricing() {
  return (
    <section id="legacy-curation" className="studio-pricing bg-[#0a0a0a] py-24 text-white">
      <div className="mx-auto max-w-6xl space-y-12 px-6">
        <SectionHeader
          eyebrow="Legacy Curation"
          title="Start free. Grow your family's archive."
          description="Preserve voices and stories in your vault — upgrade when you're ready for deeper curation."
          align="center"
          variant="dark"
        />
        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                "pricing-card flex h-full flex-col rounded-2xl border p-8",
                tier.popular
                  ? "border-[#3a2800] bg-[#0e0c00]"
                  : tier.featured
                    ? "border-[#E6A817]/30 bg-[#111]"
                    : "border-[#1e1e1e] bg-[#111]",
              )}
            >
              <div className="pricing-card-body flex flex-1 flex-col">
                <div className="flex min-h-9 items-start justify-between gap-2">
                  <h3 className="text-2xl font-semibold text-white">{tier.name}</h3>
                  {tier.badge ? (
                    <span
                      className="shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ backgroundColor: `${GOLD}33`, color: GOLD }}
                    >
                      {tier.badge}
                    </span>
                  ) : tier.featured ? (
                    <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-white">
                      Free
                    </span>
                  ) : (
                    <span className="invisible shrink-0 px-3 py-1 text-xs" aria-hidden>
                      —
                    </span>
                  )}
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-[#888]">
                  {tier.tagline}
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {tier.price}
                  {tier.id === "keeper" ? (
                    <span className="text-base font-normal text-[#888]">/mo</span>
                  ) : null}
                  {tier.id === "heritage" ? (
                    <span className="text-base font-normal text-[#888]">/yr</span>
                  ) : null}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[#888]">
                  {tier.description}
                </p>

                {tier.whiteSwan ? (
                  <div className="mb-4 mt-4 rounded-[10px] border border-[#1a1a1a] bg-[#0e0e0e] p-4">
                    <div className="mb-2 flex items-center gap-2.5">
                      <CasketIcon size={24} color={GOLD} />
                      <span className="text-[13px] font-medium text-white">
                        {tier.whiteSwan.title}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#888]">
                      {tier.whiteSwan.body}
                    </p>
                  </div>
                ) : null}

                <ul className="mt-4 space-y-2 text-sm text-[#ccc]">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: GOLD }}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {tier.lockedFeatures?.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[#555]">
                      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pricing-card-cta mt-auto w-full pt-6">
                <Link
                  to={tier.href}
                  className={cn(
                    "flex w-full items-center justify-center rounded-full py-3 text-center text-sm font-semibold transition",
                    tier.popular || tier.id === "keeper"
                      ? "text-[#111]"
                      : tier.featured
                        ? "bg-white text-black"
                        : "border border-[#333] bg-transparent text-white hover:border-[#555]",
                  )}
                  style={
                    tier.popular || tier.id === "keeper"
                      ? { backgroundColor: GOLD }
                      : undefined
                  }
                >
                  {tier.cta}
                </Link>
                {tier.note ? (
                  <p className="mt-3 min-h-[2.5rem] text-center text-[11px] leading-snug text-[#555]">
                    {tier.note}
                  </p>
                ) : (
                  <p className="mt-3 min-h-[2.5rem]" aria-hidden />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}