import { useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { FeatureCard } from "@/components/framer/FeatureCard";
import { TestimonialsCarousel } from "@/components/framer/TestimonialsCarousel";
import { CTAButton } from "@/components/framer/CTAButton";
import { ProductsPanel } from "@/components/shopify/ProductsPanel";
import { AdZone } from "@/components/AdZone";
import { Palette, Heart, FileText, Monitor, Box, Cloud, Sparkles } from "lucide-react";
import {
  useFaqs,
  useFeaturedEvent,
  useHeroSection,
  useMemoirTributes,
  useOfferings,
  usePricingTiers,
  useTestimonials,
  useSiteSettings,
  type PricingTier,
  type Testimonial,
} from "@/hooks/usePublicContent";

export const FALLBACK_LANDING_HERO = {
  slug: "landing-hero",
  heading: "Crafting Meaningful Farewells",
  subheading:
    "We believe farewells are not the end — they're the final chapter of love. Every ceremony, every detail, every design is our way of saying: Thank you for a life well lived!",
  cta_label: "Create a Memoir",
  cta_href: "/contact#hero",
  background_media: {
    src: "https://framerusercontent.com/images/ZwPzi3XEJV1BavrysIhb7QSOE0.jpg?width=4680&height=3120",
    alt: "Memorial scene with family celebrating a life well lived",
  },
  reviews: "100+ Positive Client Reviews",
} as const;

const iconMap: Record<string, JSX.Element> = {
  palette: <Palette className="h-5 w-5" strokeWidth={1.5} />,
  heart: <Heart className="h-5 w-5" strokeWidth={1.5} />,
  "file-text": <FileText className="h-5 w-5" strokeWidth={1.5} />,
  monitor: <Monitor className="h-5 w-5" strokeWidth={1.5} />,
  box: <Box className="h-5 w-5" strokeWidth={1.5} />,
  cloud: <Cloud className="h-5 w-5" strokeWidth={1.5} />,
};

const resolveIcon = (iconKey?: string | null) => iconMap[iconKey ?? ""] ?? <Sparkles className="h-5 w-5" strokeWidth={1.5} />;

const Landing = () => {
  const { data: heroSection } = useHeroSection("landing-hero");
  const { data: siteSettings } = useSiteSettings();
  const { data: offerings } = useOfferings();
  const { data: landingTestimonials } = useTestimonials("landing");
  const { data: tributes } = useMemoirTributes("monica-manu");
  const { data: faqs } = useFaqs();
  const { data: pricingTiers } = usePricingTiers();
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

    // Static fallback (eternal)
    return {
      slug: FALLBACK_LANDING_HERO.slug,
      heading: FALLBACK_LANDING_HERO.heading,
      subheading: FALLBACK_LANDING_HERO.subheading,
      ctaLabel: FALLBACK_LANDING_HERO.cta_label,
      ctaHref: FALLBACK_LANDING_HERO.cta_href,
      backgroundMedia: FALLBACK_LANDING_HERO.background_media,
      reviews: FALLBACK_LANDING_HERO.reviews,
    };
  }, [heroSection, siteSettings]);

  const offeringsList = useMemo(() => {
    if (!offerings) return [];

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

  const testimonialList = useMemo(() => {
    return landingTestimonials?.filter((item) => item.surfaces.includes("landing")) ?? [];
  }, [landingTestimonials]);

  const faqList = useMemo(() => {
    if (!faqs) return [];

    return faqs.slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [faqs]);

  const pricingList = useMemo(() => {
    if (!pricingTiers) return [];

    return pricingTiers.slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [pricingTiers]);

  const event = useMemo(() => {
    return featuredEvent ?? null;
  }, [featuredEvent]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <Hero
        headline={hero.heading}
        paragraph={hero.subheading ?? ""}
        ctaText={hero.ctaLabel ?? "Create a Memoir"}
        ctaLink={hero.ctaHref ?? "/contact"}
        reviews={hero.reviews ?? "100+ Positive Client Reviews"}
        backgroundImage={hero.backgroundMedia?.src}
      />

      <main className="flex flex-col pb-24 lg:pb-32">
        <div className="mx-auto mt-8 w-full max-w-6xl px-6">
          <AdZone placement="home_hero" />
        </div>
        <section className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
          <SectionHeader
            eyebrow="Offerings"
            title="Our Signature Concierge Services"
            description="Every detail is handcrafted — from storytelling and staging to the keepsakes families will hold for generations."
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {offeringsList.map((feature) => (
              <FeatureCard key={feature.id} title={feature.title} description={feature.description} icon={feature.icon} />
            ))}
          </div>
        </section>

        <section className="bg-white py-24 text-black">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeader
              eyebrow="Stories"
              title="What Families Say"
              description="Kind words from the people who trusted us to honour a life well lived."
              align="center"
              variant="light"
            />
            {testimonialList.length > 0 ? <TestimonialsCarousel testimonials={testimonialList} className="mt-10" variant="light" /> : null}
          </div>
        </section>

        <section className="bg-white py-24 text-black">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHeader
              eyebrow="FAQ"
              title="Questions We Hear Often"
              description="We blend broadcast-quality production with the intimacy families deserve. If you don’t see your question please reach out."
              align="center"
              variant="light"
            />
            {faqList.length > 0 ? (
              <div className="mt-10 space-y-4">
                {faqList.map((faq) => (
                  <details
                    key={faq.id}
                    className="rounded-lg border border-black/10 bg-white p-6 shadow-glass transition hover:shadow-lg"
                  >
                    <summary className="cursor-pointer list-none text-left text-lg font-medium text-black">{faq.question}</summary>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {event ? (
          <section className="mx-auto max-w-6xl px-6 py-24">
            <div className="glass-panel flex flex-col overflow-hidden rounded-[30px] border border-white/10 md:flex-row">
              <div className="flex-1 space-y-4 px-8 py-10 md:px-12">
                <SectionHeader
                  eyebrow="Events"
                  title="Because the last goodbye should be unforgettable."
                  description={event.description ?? "Explore our featured celebration to see how we transform memories into immersive experiences."}
                />
                <CTAButton to="/memoirs" label="Observe" />
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

        <section className="bg-black py-24 text-white">
          <div className="mx-auto max-w-6xl space-y-12 px-6">
            <SectionHeader
              eyebrow="Pricing"
              title="Choose the experience that fits your celebration"
              description="Transparent offerings with the production support families rely on. Every package can be tailored with add-ons and cultural rituals."
              align="center"
              variant="dark"
            />

            {pricingList.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-3">
                {pricingList.map((tier) => (
                  <div
                    key={tier.id}
                    className={`rounded-lg border p-8 shadow-glass transition hover:-translate-y-1 hover:shadow-xl ${tier.isRecommended ? "border-white/20 bg-white/10" : "border-white/10 bg-white/5"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-semibold text-white">{tier.name}</h3>
                      {tier.isRecommended ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white">
                          <Sparkles className="h-3.5 w-3.5" /> {tier.badgeLabel ?? "Featured"}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-4 text-sm uppercase tracking-[0.3em] text-subtle">{tier.tagline ?? "Starting at"}</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{tier.priceLabel ?? "Custom"}</p>
                    <p className="mt-4 text-sm leading-relaxed text-subtle">{tier.description}</p>
                    <ul className="mt-6 space-y-2 text-sm text-subtle">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white/80" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <CTAButton
                      to="/contact#hero"
                      label="Plan with us"
                      className={`mt-8 w-full justify-center ${tier.isRecommended ? "bg-white text-black" : "bg-white/15 text-white"
                        }`}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {/* Products Panel */}
        <ProductsPanel title="Featured Products" description="Explore our collection of memorial products and services." />
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
