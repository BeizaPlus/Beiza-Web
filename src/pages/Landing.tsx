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
  usePublishedMemoirTributes,
  useTestimonials,
  useSiteSettings,
} from "@/hooks/usePublicContent";
import type { Testimonial as CarouselTestimonial } from "@/components/framer/TestimonialsCarousel";
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

/** Re-enable when featured-event Experience flow is ready. */
const SHOW_FEATURED_EVENT_EXPERIENCE_CTA = false;

const Landing = () => {
  const { enabled: studio, state: studioState, setState: setStudioState } = useLandingLayoutStudio(studioEnabled);
  const focus = studio ? studioState.focus : null;

  const { data: heroSection } = useHeroSection("landing-hero");
  const { data: siteSettings } = useSiteSettings();
  const { data: offerings = [] } = useOfferings();
  const { data: landingTestimonials = [] } = useTestimonials("landing");
  const { data: publishedTributes = [] } = usePublishedMemoirTributes();
  const { data: faqs = [] } = useFaqs();
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

  const storiesCarouselItems = useMemo((): CarouselTestimonial[] => {
    const testimonialList = landingTestimonials.filter((item) => item.surfaces.includes("landing"));

    const tributeItems: CarouselTestimonial[] = publishedTributes
      .slice()
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((item) => ({
        quote: item.message,
        author: item.name,
        role: item.relationship ?? undefined,
      }));

    const testimonialItems: CarouselTestimonial[] = testimonialList.map((item) => ({
      quote: item.quote,
      author: item.author,
      role: item.role ?? undefined,
    }));

    const key = (item: CarouselTestimonial) =>
      `${item.author.toLowerCase()}|${item.quote.trim().toLowerCase()}`;
    const seen = new Set<string>();
    const merged: CarouselTestimonial[] = [];

    const pushUnique = (item: CarouselTestimonial) => {
      const k = key(item);
      if (seen.has(k)) return;
      seen.add(k);
      merged.push(item);
    };

    const madamRose =
      testimonialItems.find((item) => item.author.toLowerCase() === "madamrose") ??
      tributeItems.find((item) => item.author.toLowerCase() === "madamrose");

    if (madamRose) pushUnique(madamRose);
    tributeItems.forEach(pushUnique);
    testimonialItems.forEach(pushUnique);

    return merged;
  }, [landingTestimonials, publishedTributes]);

  const faqList = useMemo(
    () => faqs.slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [faqs],
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
            {storiesCarouselItems.length > 0 ? (
              <TestimonialsCarousel testimonials={storiesCarouselItems} className="mt-10" variant="light" />
            ) : null}
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
                {SHOW_FEATURED_EVENT_EXPERIENCE_CTA ? (
                  <CTAButton to="/memoirs" label="Experience" />
                ) : null}
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
          <ProductsPanel title="Featured Products" description="Explore our collection of legacy products and services." />
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
