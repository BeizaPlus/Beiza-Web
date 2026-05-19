import { useMemo, type CSSProperties } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { LegacyCurationPricing } from "@/components/landing/LegacyCurationPricing";
import { LegacyOutro } from "@/components/landing/LegacyOutro";
import { WhatWeDoSection } from "@/components/landing/WhatWeDoSection";
import {
  LandingLayoutStudioPanel,
  useLandingLayoutStudio,
} from "@/components/dev/LandingLayoutStudio";
import { studioCssVars } from "@/components/dev/landingLayoutStudioState";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { TestimonialsCarousel } from "@/components/framer/TestimonialsCarousel";
import { CTAButton } from "@/components/framer/CTAButton";
import { FAQItem } from "@/components/framer/FAQItem";
import { ProductsPanel } from "@/components/shopify/ProductsPanel";
import { AdZone } from "@/components/AdZone";
import { Palette, Heart, FileText, Monitor, Box, Cloud, Sparkles } from "lucide-react";
import {
  useFaqs,
  useFeaturedEvent,
  useHeroSection,
  useOfferings,
  usePricingTiers,
  useTestimonials,
  useSiteSettings,
} from "@/hooks/usePublicContent";
import { FALLBACK_HERO_LANDING } from "@/lib/fallbackContent";

const iconMap: Record<string, JSX.Element> = {
  palette: <Palette className="h-5 w-5" strokeWidth={1.5} />,
  heart: <Heart className="h-5 w-5" strokeWidth={1.5} />,
  "file-text": <FileText className="h-5 w-5" strokeWidth={1.5} />,
  monitor: <Monitor className="h-5 w-5" strokeWidth={1.5} />,
  box: <Box className="h-5 w-5" strokeWidth={1.5} />,
  cloud: <Cloud className="h-5 w-5" strokeWidth={1.5} />,
};

const resolveIcon = (iconKey?: string | null) => iconMap[iconKey ?? ""] ?? <Sparkles className="h-5 w-5" strokeWidth={1.5} />;

const studioEnabled =
  import.meta.env.DEV &&
  (typeof window === "undefined" || new URLSearchParams(window.location.search).get("studio") !== "0");

const Landing = () => {
  const { enabled: studio, state: studioState, setState: setStudioState } = useLandingLayoutStudio(studioEnabled);
  const focus = studio ? studioState.focus : null;

  const { data: heroSection } = useHeroSection("landing-hero");
  const { data: siteSettings } = useSiteSettings();
  const { data: offerings = [] } = useOfferings();
  const { data: landingTestimonials = [] } = useTestimonials("landing");
  const { data: faqs = [] } = useFaqs();
  const { data: pricingTiers = [] } = usePricingTiers();
  const { data: featuredEvent } = useFeaturedEvent();

  const hero = useMemo(() => {
    // Priority: 1. Database hero_sections, 2. Site settings, 3. Static fallback
    if (heroSection)
    {
      return heroSection;
    }

    // Use site settings if available
    if (siteSettings?.heroHeading)
    {
      return {
        slug: "landing-hero",
        heading: siteSettings.heroHeading,
        subheading: siteSettings.heroSubheading ?? null,
        ctaLabel: siteSettings.heroCtaLabel ?? null,
        ctaHref: siteSettings.heroCtaHref ?? null,
        backgroundMedia: siteSettings.heroBackgroundImage ? {
          src: siteSettings.heroBackgroundImage,
          alt: siteSettings.heroBackgroundAlt ?? "",
        } : null,
        reviews: siteSettings.heroReviews ?? null,
      };
    }

    return {
      slug: FALLBACK_HERO_LANDING.slug,
      heading: FALLBACK_HERO_LANDING.heading,
      subheading: FALLBACK_HERO_LANDING.subheading,
      ctaLabel: FALLBACK_HERO_LANDING.ctaLabel,
      ctaHref: FALLBACK_HERO_LANDING.ctaHref,
      backgroundMedia: FALLBACK_HERO_LANDING.backgroundMedia,
      reviews: FALLBACK_HERO_LANDING.reviews,
    };
  }, [heroSection, siteSettings]);

  const offeringsList = useMemo(() => {
    return offerings
      .slice()
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description ?? undefined,
        icon: resolveIcon(item.iconKey),
      }));
  }, [offerings]);

  // const tributeList = useMemo(() => {
  //   // Always use static tributes as fallback for "Loved by Families" section
  //   const list = tributes ?? FALLBACK_MEMOIR_TRIBUTES.map((item) => ({
  //     id: item.id,
  //     name: item.name,
  //     relationship: item.relationship,
  //     message: item.message,
  //     displayOrder: item.display_order,
  //   }));

  //   return list
  //     .slice()
  //     .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
  //     .map((item) => ({
  //       name: item.name,
  //       relationship: item.relationship ?? "",
  //       message: item.message,
  //     }));
  // }, [tributes]);

  const testimonialList = useMemo(
    () => landingTestimonials.filter((item) => item.surfaces.includes("landing")),
    [landingTestimonials],
  );

  const faqList = useMemo(
    () => faqs.slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [faqs],
  );

  const pricingList = useMemo(
    () => pricingTiers.slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [pricingTiers],
  );

  const event = useMemo(() => {
    return featuredEvent ?? null;
  }, [featuredEvent]);

  const showHero = !studio || focus === "hero";
  const showOfferings = !studio || focus === "offerings";
  const showFaq = !studio || focus === "faq";
  const showPricing = !studio || focus === "pricing";
  const showOutro = !studio || focus === "outro";
  const showRest = !studio;

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={studio ? (studioCssVars(studioState) as CSSProperties) : undefined}
    >
      <Navigation />
      {showHero ? (
        <Hero
          headline={hero.heading}
          paragraph={hero.subheading ?? ""}
          ctaText={hero.ctaLabel ?? "Start Your Legacy"}
          ctaLink={hero.ctaHref ?? "/legacy"}
          reviews={hero.reviews ?? undefined}
          backgroundImage={hero.backgroundMedia?.src}
          backgroundPosition={
            studio ? `${studioState.hero.posX}% ${studioState.hero.posY}%` : undefined
          }
          backgroundScale={studio ? studioState.hero.scale : undefined}
        />
      ) : null}

      <main className="flex flex-col pb-24 lg:pb-32">
        {showRest ? (
          <div className="mx-auto mt-8 w-full max-w-6xl px-6">
            <AdZone placement="home_hero" />
          </div>
        ) : null}
        {showOfferings ? (
          <WhatWeDoSection
            offerings={offeringsList}
            mockupSrc="/images/legacy-mockup.png"
            style={
              studio
                ? {
                    transform: `translateY(var(--offerings-offset-y))`,
                    paddingTop: `var(--offerings-padding-top)`,
                  }
                : undefined
            }
          />
        ) : null}

        {showRest ? (
        <section className="bg-white py-24 text-black">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeader
              eyebrow="Stories"
              title="What Families Say"
              description="Kind words from families who trusted us to preserve their story, kept forever."
              align="center"
              variant="light"
            />
            {testimonialList.length > 0 ? <TestimonialsCarousel testimonials={testimonialList} className="mt-10" variant="light" /> : null}
          </div>
        </section>
        ) : null}

        {showFaq ? (
        <section
          className="studio-faq bg-white py-24 text-black"
          style={
            studio
              ? {
                  transform: `translateY(var(--faq-offset-y))`,
                  paddingTop: `var(--faq-padding-top)`,
                }
              : undefined
          }
        >
          <div className="mx-auto max-w-5xl px-6">
            <SectionHeader
              eyebrow="FAQ"
              title="Everything you need to know"
              align="center"
              variant="light"
            />
            {faqList.length > 0 ? (
              <div className="mt-12">
                {faqList.map((faq) => (
                  <FAQItem key={faq.id} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            ) : null}
          </div>
        </section>
        ) : null}

        {showRest && event ? (
          <section className="mx-auto max-w-6xl px-6 py-24">
            <div className="glass-panel flex flex-col overflow-hidden rounded-[30px] border border-white/10 md:flex-row">
              <div className="flex-1 space-y-4 px-8 py-10 md:px-12">
                <SectionHeader
                  eyebrow="Events"
                  title="Because their story deserves to be unforgettable."
                  description={event.description ?? "Explore our featured celebration to see how we transform memories into immersive experiences."}
                />
                <CTAButton to="/memoirs" label="Experience" />
              </div>
              {event.heroMedia?.src ? (
                <div className="relative aspect-[4/5] w-full overflow-hidden md:w-1/3">
                  <img
                    src={event.heroMedia.src}
                    alt={event.heroMedia.alt ?? event.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {showPricing ? (
        <div
          style={
            studio
              ? {
                  transform: `translateY(var(--pricing-offset-y))`,
                  paddingTop: `var(--pricing-padding-top)`,
                }
              : undefined
          }
        >
          <LegacyCurationPricing />
        </div>
        ) : null}

        {showRest ? (
        <>
        <section className="bg-black py-24 text-white">
          <div className="mx-auto max-w-6xl space-y-12 px-6">
            <SectionHeader
              eyebrow="Pricing"
              title="Choose the experience that fits your family"
              description="Transparent offerings with the production support families rely on. Every package can be tailored with add-ons and cultural rituals."
              align="center"
              variant="dark"
            />

            {pricingList.length > 0 ? (
              <div className="grid items-stretch gap-6 md:grid-cols-3">
                {pricingList.map((tier) => (
                  <div
                    key={tier.id}
                    className={`flex h-full flex-col rounded-lg border p-8 shadow-glass transition hover:-translate-y-1 hover:shadow-xl ${tier.isRecommended ? "border-white/20 bg-white/10" : "border-white/10 bg-white/5"
                      }`}
                  >
                    <div className="flex min-h-9 items-start justify-between gap-2">
                      <h3 className="text-2xl font-semibold text-white">{tier.name}</h3>
                      {tier.isRecommended ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white">
                          <Sparkles className="h-3.5 w-3.5" /> {tier.badgeLabel ?? "Featured"}
                        </span>
                      ) : (
                        <span className="invisible inline-flex shrink-0 px-3 py-1 text-xs" aria-hidden>
                          —
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-sm uppercase tracking-[0.3em] text-subtle">{tier.tagline ?? "Starting at"}</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{tier.priceLabel ?? "Custom"}</p>
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
                        to="/contact#hero"
                        label="Plan with us"
                        className={`w-full justify-center ${tier.isRecommended ? "bg-white text-black" : "bg-white/15 text-white"
                          }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <ProductsPanel title="Featured Products" description="Explore our collection of legacy products and services." />
        </>
        ) : null}

        {showOutro ? (
        <div
          style={
            studio
              ? {
                  transform: `translateY(var(--outro-offset-y))`,
                  paddingTop: `var(--outro-padding-top)`,
                }
              : undefined
          }
        >
          <LegacyOutro />
        </div>
        ) : null}
      </main>

      {showRest ? <Footer /> : null}
      {studio ? <LandingLayoutStudioPanel state={studioState} onChange={setStudioState} /> : null}
    </div>
  );
};

export default Landing;
