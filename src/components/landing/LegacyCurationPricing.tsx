import { CTAButton } from "@/components/framer/CTAButton";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { Sparkles } from "lucide-react";

const TIERS = [
  {
    id: "circle",
    name: "Circle",
    price: "Free",
    tagline: "Start preserving",
    description:
      "Your family Legacy Circle — record voices, store memories in the vault, and invite relatives to contribute.",
    features: [
      "1 Legacy Circle",
      "Voice recordings in your vault",
      "Family invite codes",
      "5 GB shared storage",
    ],
    cta: "Start free",
    href: "/legacy/family",
    featured: true,
  },
  {
    id: "keeper",
    name: "Keeper",
    price: "GHS 49",
    tagline: "Per month",
    description: "For families who want AI prompts, longer archives, and priority curation support.",
    features: [
      "Everything in Circle",
      "AI story prompts (Well)",
      "50 GB storage",
      "Download & share recordings",
    ],
    cta: "Upgrade",
    href: "/legacy",
    featured: false,
  },
  {
    id: "heritage",
    name: "Heritage",
    price: "Custom",
    tagline: "White-glove",
    description:
      "Full legacy curation — produced films, printed keepsakes, and cross-border family coordination.",
    features: [
      "Dedicated legacy producer",
      "Cinematic tribute films",
      "Heirloom books & galleries",
      "Multi-day experiences",
    ],
    cta: "Plan with us",
    href: "/contact#hero",
    featured: false,
  },
] as const;

export function LegacyCurationPricing() {
  return (
    <section className="studio-pricing bg-black py-24 text-white">
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
              className={`flex h-full flex-col rounded-lg border p-8 shadow-glass transition hover:-translate-y-1 hover:shadow-xl ${
                tier.featured ? "border-primary/40 bg-primary/10" : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex min-h-9 items-start justify-between gap-2">
                <h3 className="text-2xl font-semibold text-white">{tier.name}</h3>
                {tier.featured ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-xs uppercase tracking-[0.25em] text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> Free
                  </span>
                ) : (
                  <span className="invisible inline-flex shrink-0 px-3 py-1 text-xs" aria-hidden>
                    Free
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm uppercase tracking-[0.3em] text-subtle">{tier.tagline}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{tier.price}</p>
              <p className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-subtle">{tier.description}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-subtle">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-white/80" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto w-full pt-8">
                <CTAButton
                  to={tier.href}
                  label={tier.cta}
                  className={`w-full justify-center ${
                    tier.featured ? "bg-white text-black" : "bg-white/15 text-white"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
