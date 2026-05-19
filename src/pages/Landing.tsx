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
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import { studioCssVars } from "@/components/dev/landingLayoutStudioState";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { FullBleedHero } from "@/components/FullBleedHero";
import { VoicesThatStayedSection } from "@/components/landing/VoicesThatStayedSection";
import { BRAND_IMAGES, HERO_OVERLAY_GRADIENT } from "@/lib/brandImages";
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

const studioPanelEnabled = isLayoutStudioEnabled();

/** Re-enable when featured-event Experience flow is ready. */
const SHOW_FEATURED_EVENT_EXPERIENCE_CTA = false;

const Landing = () => {
  const { panelEnabled: studio, state: studioState, setState: setStudioState } =
    useLandingLayoutStudio(studioPanelEnabled);
  const focus = studio ? studioState.focus : null;

  const { data: heroSection } = useHeroSection("landing-hero");
  const { data: siteSettings } = useSiteSettings();
  const { data: offerings = [] } = useOfferings();
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
          backgroundImage={hero.backgroundMedia?.src ?? BRAND_IMAGES.homepageHero}
          backgroundPosition={`${studioState.hero.posX}% ${studioState.hero.posY}%`}
          backgroundScale={studioState.hero.scale}
          overlayStyle={{ background: HERO_OVERLAY_GRADIENT }}
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
            mockupSrc="/images/the-leader-mockup.png"
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

        {showRest ? <VoicesThatStayedSection /> : null}

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
          <FullBleedHero
            imageSrc={event.heroMedia?.src ?? BRAND_IMAGES.eventsStoriesHero}
            imageAlt={event.heroMedia?.alt ?? event.title ?? "Featured celebration"}
            objectPosition="center top"
          >
            <div className="max-w-xl text-left">
              <SectionHeader
                eyebrow="Events"
                title="Because their story deserves to be unforgettable."
                description={
                  event.description ??
                  "Explore our featured celebration to see how we transform memories into immersive experiences."
                }
                variant="dark"
              />
              {SHOW_FEATURED_EVENT_EXPERIENCE_CTA ? (
                <div className="mt-8">
                  <CTAButton to="/memoirs" label="Experience" />
                </div>
              ) : null}
            </div>
          </FullBleedHero>
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
