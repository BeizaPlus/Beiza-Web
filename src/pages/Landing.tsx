import { useMemo, type CSSProperties } from "react";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { LegacyCurationPricing } from "@/components/landing/LegacyCurationPricing";
import { AboutSection } from "@/components/AboutSection";
import { LegacyOutro } from "@/components/landing/LegacyOutro";
import { WhatWeDoSection } from "@/components/landing/WhatWeDoSection";
import { EducationTopLocaleSwitcher } from "@/components/landing/EducationTopLocaleSwitcher";
import {
  LandingLayoutStudioPanel,
  useLandingLayoutStudio,
} from "@/components/dev/LandingLayoutStudio";
import { copyOffsetStyle } from "@/lib/copyLayoutOffset";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { saveStudioState, studioCssVars } from "@/components/dev/landingLayoutStudioState";
import { BRAND_IMAGES } from "@/lib/brandImages";
import { resolveHeroBackgroundSrc } from "@/lib/resolveHeroImage";
import { HomeFaqSection } from "@/components/framer/HomeFaqSection";
import type { FaqAccordionEntry } from "@/components/framer/FaqAccordionGroup";
import { ArmAnchorMenu } from "@/components/marketing/ArmAnchorMenu";
import {
  EDUCATION_HOME_FAQ_TITLE,
  resolveEducationHomeFaqs,
} from "@/lib/educationHomeFaqs";
import { EDUCATION_ARM_ANCHORS } from "@/lib/armNavLinks";
import { ProductsPanel } from "@/components/shopify/ProductsPanel";
import { AdZone } from "@/components/AdZone";
import { CulturePdfLeadSection } from "@/components/landing/CulturePdfLeadSection";
import { AdinkraSymbolsListSection } from "@/components/landing/AdinkraSymbolsListSection";
import { InstagramReelsSection } from "@/components/landing/InstagramReelsSection";
import { Palette, Heart, FileText, Monitor, Box, Cloud, Sparkles } from "lucide-react";
import {
  useFaqs,
  useHeroSection,
  useOfferings,
  useSiteSettings,
} from "@/hooks/usePublicContent";
import { FALLBACK_HERO_LANDING } from "@/lib/fallbackContent";
import { allowStaticContentFallback } from "@/lib/contentPolicy";
import {
  educationHeroHeading,
  educationHeroSubheading,
  educationHomeLocaleSubheading,
} from "@/lib/educationPageCopy";
import { useLocale } from "@/hooks/useLocale";

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
  const locale = useLocale();
  const studioPanelEnabled = isLayoutStudioEnabled();
  const { panelEnabled: studio, state: studioState, setState: setStudioState } =
    useLandingLayoutStudio(studioPanelEnabled);
  const focus = studio ? studioState.focus : null;

  const { data: heroSection } = useHeroSection("landing-hero");
  const { data: siteSettings } = useSiteSettings();
  const { data: offerings = [] } = useOfferings();
  const { data: faqs = [] } = useFaqs();

  const hero = useMemo(() => {
    const localeSubheading = educationHeroSubheading(educationHomeLocaleSubheading(locale));
    const educationHeading = (raw?: string | null) => educationHeroHeading(raw);

    // Priority: 1. Database hero_sections, 2. Site settings, 3. Static fallback
    if (heroSection) {
      return {
        ...heroSection,
        heading: educationHeading(heroSection.heading),
        subheading: localeSubheading,
      };
    }

    // Use site settings if available
    if (siteSettings?.heroHeading)
    {
      return {
        slug: "landing-hero",
        heading: educationHeading(siteSettings.heroHeading),
        subheading: localeSubheading,
        ctaLabel: siteSettings.heroCtaLabel ?? null,
        ctaHref: siteSettings.heroCtaHref ?? null,
        backgroundMedia: siteSettings.heroBackgroundImage ? {
          src: siteSettings.heroBackgroundImage,
          alt: siteSettings.heroBackgroundAlt ?? "",
        } : null,
        reviews: siteSettings.heroReviews ?? null,
      };
    }

    if (!allowStaticContentFallback()) {
      return null;
    }

    return {
      slug: FALLBACK_HERO_LANDING.slug,
      heading: educationHeading(FALLBACK_HERO_LANDING.heading),
        subheading: localeSubheading,
      ctaLabel: FALLBACK_HERO_LANDING.ctaLabel,
      ctaHref: FALLBACK_HERO_LANDING.ctaHref,
      backgroundMedia: FALLBACK_HERO_LANDING.backgroundMedia,
      reviews: FALLBACK_HERO_LANDING.reviews,
    };
  }, [heroSection, siteSettings, locale]);

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

  const homeFaqItems = useMemo(
    (): FaqAccordionEntry[] =>
      resolveEducationHomeFaqs(
        faqList.map((faq) => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          displayOrder: faq.displayOrder,
        })),
      ),
    [faqList],
  );

  /** Heritage hero panel targets /heritage — never blank education home in studio mode. */
  const studioExclusive = studio && focus !== "heritageHero";
  const landingFocus = studioExclusive ? focus : "hero";

  const showHero = !studioExclusive || landingFocus === "hero";
  const showLocaleRail = !studioExclusive || landingFocus === "localeRail";
  const showOfferings = !studioExclusive || landingFocus === "offerings";
  const showFaq = !studioExclusive || landingFocus === "faq";
  const showPricing = !studioExclusive || landingFocus === "pricing";
  const showOutro = !studioExclusive || landingFocus === "outro";
  const showRest = !studioExclusive;

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={studioCssVars(studioState) as CSSProperties}
    >
      <ArmAnchorMenu
        links={EDUCATION_ARM_ANCHORS}
        className="pointer-events-auto fixed right-[max(1rem,var(--beiza-site-padding-x))] top-20 z-40"
      />
      {showHero ? (
        <Hero
          headline={hero?.heading}
          paragraph={hero?.subheading ?? ""}
          ctaText={hero?.ctaLabel ?? "Start Your Legacy"}
          ctaLink={hero?.ctaHref ?? BEIZA_LINKS.legacy.app}
          reviews={hero?.reviews ?? undefined}
          backgroundImage={resolveHeroBackgroundSrc(
            hero?.backgroundMedia?.src,
            BRAND_IMAGES.homepageHero,
          )}
          backgroundPosition={`${studioState.hero.posX}% ${studioState.hero.posY}%`}
          backgroundScale={studioState.hero.scale}
          copyOffsetStyle={copyOffsetStyle({
            offsetX: studioState.hero.copyOffsetX,
            offsetY: studioState.hero.copyOffsetY,
          })}
        />
      ) : null}

      <main className="flex flex-col pb-24 lg:pb-32">
        {showLocaleRail ? <EducationTopLocaleSwitcher /> : null}
        {showRest ? (
          <InstagramReelsSection
            id="cultural-films"
            variant="bare"
            className="mt-6 min-[768px]:mt-8"
          />
        ) : null}
        {showRest ? <AdinkraSymbolsListSection /> : null}
        {showRest ? <CulturePdfLeadSection /> : null}
        {showRest ? (
          <div className="mx-auto mt-8 w-full max-w-6xl px-6">
            <AdZone placement="home_hero" />
          </div>
        ) : null}
        {showOfferings ? (
          <WhatWeDoSection
            offerings={offeringsList}
            variant="educationSimple"
            showLocaleToggle={false}
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

        {showRest ? <AboutSection /> : null}

        {showFaq ? (
          <div
            id="education-faqs"
            className="scroll-mt-24 studio-faq"
            style={
              studio
                ? {
                    transform: `translateY(var(--faq-offset-y))`,
                    paddingTop: `var(--faq-padding-top)`,
                  }
                : undefined
            }
          >
            <HomeFaqSection items={homeFaqItems} title={EDUCATION_HOME_FAQ_TITLE} />
          </div>
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
          <LegacyCurationPricing
            content={studio ? studioState.pricingContent : undefined}
            editable={studio && focus === "pricing"}
            onContentChange={(pricingContent) => {
              const next = { ...studioState, pricingContent };
              setStudioState(next);
              saveStudioState(next);
            }}
          />
        </div>
        ) : null}

        {showRest ? (
          <section id="your-language" className="scroll-mt-24">
            <ProductsPanel title="Featured Products" description="Explore our collection of legacy products and services." />
          </section>
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
