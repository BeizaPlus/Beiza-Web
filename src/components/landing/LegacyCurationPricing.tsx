import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { CasketIcon } from "@/components/icons/CasketIcon";
import { StudioEditableText } from "@/components/dev/StudioEditableText";
import { marketingCardClassName, marketingContainer, marketingSection } from "@/lib/brandUi";
import {
  DEFAULT_PRICING_CONTENT,
  TIER_HREFS,
  tierFlags,
  type PricingSectionContent,
  type PricingTierContent,
} from "@/lib/landingPricingContent";
import { cn } from "@/lib/utils";

type LegacyCurationPricingProps = {
  content?: PricingSectionContent;
  editable?: boolean;
  onContentChange?: (content: PricingSectionContent) => void;
};

export function LegacyCurationPricing({
  content = DEFAULT_PRICING_CONTENT,
  editable = false,
  onContentChange,
}: LegacyCurationPricingProps) {
  const patch = (partial: Partial<PricingSectionContent>) => {
    onContentChange?.({ ...content, ...partial });
  };

  const patchTier = (tierId: string, partial: Partial<PricingTierContent>) => {
    patch({
      tiers: content.tiers.map((t) => (t.id === tierId ? { ...t, ...partial } : t)),
    });
  };

  const patchFeature = (tierId: string, index: number, text: string) => {
    const tier = content.tiers.find((t) => t.id === tierId);
    if (!tier) return;
    const features = [...tier.features];
    features[index] = text;
    patchTier(tierId, { features });
  };

  const patchLockedFeature = (tierId: string, index: number, text: string) => {
    const tier = content.tiers.find((t) => t.id === tierId);
    if (!tier?.lockedFeatures) return;
    const lockedFeatures = [...tier.lockedFeatures];
    lockedFeatures[index] = text;
    patchTier(tierId, { lockedFeatures });
  };

  return (
    <section id="legacy-curation" className={cn("studio-pricing", marketingSection)}>
      <div className={cn(marketingContainer, "space-y-12")}>
        <SectionHeader
          eyebrow={
            <StudioEditableText
              enabled={editable}
              value={content.eyebrow}
              onChange={(eyebrow) => patch({ eyebrow })}
            />
          }
          title={
            <StudioEditableText
              enabled={editable}
              value={content.title}
              onChange={(title) => patch({ title })}
            />
          }
          description={
            <StudioEditableText
              enabled={editable}
              as="p"
              multiline
              value={content.description}
              onChange={(description) => patch({ description })}
            />
          }
          align="center"
          variant="dark"
        />

        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {content.tiers.map((tier) => {
            const { featured, popular } = tierFlags(tier.id);
            const href = TIER_HREFS[tier.id] ?? "/pricing";

            return (
              <div
                key={tier.id}
                className={cn(
                  marketingCardClassName({ featured, highlight: popular }),
                  "pricing-card h-full p-8",
                )}
              >
                <div className="pricing-card-body flex flex-col">
                  <div className="flex min-h-9 items-start justify-between gap-2">
                    <StudioEditableText
                      enabled={editable}
                      as="h3"
                      value={tier.name}
                      onChange={(name) => patchTier(tier.id, { name })}
                      className="text-2xl font-semibold tracking-tight text-white"
                    />
                    {tier.badge ? (
                      <StudioEditableText
                        enabled={editable}
                        value={tier.badge}
                        onChange={(badge) => patchTier(tier.id, { badge })}
                        className="shrink-0 rounded-full bg-primary/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary"
                      />
                    ) : featured ? (
                      <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-white">
                        Free
                      </span>
                    ) : (
                      <span className="invisible shrink-0 px-3 py-1 text-xs" aria-hidden>
                        —
                      </span>
                    )}
                  </div>

                  <StudioEditableText
                    enabled={editable}
                    as="p"
                    value={tier.tagline}
                    onChange={(tagline) => patchTier(tier.id, { tagline })}
                    className="text-eyebrow mt-4 text-xs"
                  />

                  <p className="mt-2 text-3xl font-semibold text-white">
                    <StudioEditableText
                      enabled={editable}
                      value={tier.price}
                      onChange={(price) => patchTier(tier.id, { price })}
                      className="inline"
                    />
                    {tier.id === "keeper" ? (
                      <span className="text-base font-normal text-muted-foreground">/mo</span>
                    ) : null}
                    {tier.id === "heritage" ? (
                      <span className="text-base font-normal text-muted-foreground">/yr</span>
                    ) : null}
                  </p>

                  <StudioEditableText
                    enabled={editable}
                    as="p"
                    multiline
                    value={tier.description}
                    onChange={(description) => patchTier(tier.id, { description })}
                    className="mt-4 text-sm leading-relaxed text-subtle"
                  />

                  {tier.whiteSwan ? (
                    <div className="mb-4 mt-4 rounded-lg border border-border bg-secondary/40 p-4">
                      <div className="mb-2 flex items-center gap-2.5">
                        <CasketIcon size={24} className="text-primary" />
                        <StudioEditableText
                          enabled={editable}
                          value={tier.whiteSwan.title}
                          onChange={(title) =>
                            patchTier(tier.id, { whiteSwan: { ...tier.whiteSwan!, title } })
                          }
                          className="text-[13px] font-medium text-white"
                        />
                      </div>
                      <StudioEditableText
                        enabled={editable}
                        as="p"
                        multiline
                        value={tier.whiteSwan.body}
                        onChange={(body) =>
                          patchTier(tier.id, { whiteSwan: { ...tier.whiteSwan!, body } })
                        }
                        className="text-xs leading-relaxed text-muted-foreground"
                      />
                    </div>
                  ) : null}

                  <ul className="mt-4 flex-1 space-y-2 text-sm text-white/90">
                    {tier.features.map((feature, index) => (
                      <li key={`${tier.id}-f-${index}`} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <StudioEditableText
                          enabled={editable}
                          value={feature}
                          onChange={(text) => patchFeature(tier.id, index, text)}
                          className="flex-1"
                        />
                      </li>
                    ))}
                    {tier.lockedFeatures?.map((feature, index) => (
                      <li
                        key={`${tier.id}-l-${index}`}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                        <StudioEditableText
                          enabled={editable}
                          value={feature}
                          onChange={(text) => patchLockedFeature(tier.id, index, text)}
                          className="flex-1"
                        />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pricing-card-cta mt-auto w-full pt-6">
                  <Link
                    to={href}
                    className={cn(
                      "flex w-full items-center justify-center rounded-full py-3 text-center text-sm font-semibold transition",
                      popular || tier.id === "keeper"
                        ? "bg-primary text-primary-foreground hover:opacity-90"
                        : featured
                          ? "bg-white text-black hover:bg-white/90"
                          : "border border-white/20 bg-transparent text-white hover:border-white/40",
                    )}
                    onClick={(e) => {
                      if (editable) e.preventDefault();
                    }}
                  >
                    <StudioEditableText
                      enabled={editable}
                      value={tier.cta}
                      onChange={(cta) => patchTier(tier.id, { cta })}
                      className="inline"
                    />
                  </Link>
                  {tier.note ? (
                    <StudioEditableText
                      enabled={editable}
                      as="p"
                      multiline
                      value={tier.note}
                      onChange={(note) => patchTier(tier.id, { note })}
                      className="mt-3 min-h-[2.5rem] text-center text-[11px] leading-snug text-muted-foreground"
                    />
                  ) : (
                    <p className="mt-3 min-h-[2.5rem]" aria-hidden />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
