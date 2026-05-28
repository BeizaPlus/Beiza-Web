import { type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/framer/SectionHeader";
import {
  HeroLayoutStudioPanel,
  useHeroLayoutStudio,
} from "@/components/dev/HeroLayoutStudio";
import { heroCopyOffsetStyle, heroStudioCssVars } from "@/components/dev/heroLayoutStudioState";
import { usePublishedEventStories, useLiveEvents, useHeroSection } from "@/hooks/usePublicContent";
import { FullBleedHero } from "@/components/FullBleedHero";
import { siteHeroCopyBlockLeft } from "@/lib/siteLayout";
import { BRAND_IMAGES } from "@/lib/brandImages";
import { allowStaticContentFallback } from "@/lib/contentPolicy";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import { LiveEventsRow } from "@/components/events/LiveEventsRow";
import { TrendingStoriesRow } from "@/components/events/TrendingStoriesRow";

const EmptyState = ({ title, description }: { title: string; description: ReactNode }) => (
  <div className="glass-panel flex flex-col items-center justify-center gap-4 rounded-[32px] border border-white/10 p-16 text-center text-white/70">
    <h2 className="text-2xl font-semibold text-white">{title}</h2>
    <p className="max-w-xl text-sm text-white/60">{description}</p>
  </div>
);

const Events = () => {
  const studioPanel = isLayoutStudioEnabled();
  const { frame: heroFrame, setFrame: setHeroFrame } = useHeroLayoutStudio("events");
  const { data: liveEvents = [], isLoading: liveLoading } = useLiveEvents();
  const { data: stories = [], isLoading: storiesLoading } = usePublishedEventStories();
  const { data: eventsHero } = useHeroSection("events-hero");

  const loading = liveLoading || storiesLoading;

  const heroImageSrc =
    eventsHero?.backgroundMedia?.src ??
    (allowStaticContentFallback() ? BRAND_IMAGES.eventsStoriesHero : undefined);
  const heroImageAlt =
    eventsHero?.backgroundMedia?.alt ?? "Events hero portrait";
  const heroTitle = eventsHero?.heading ?? "Because their story deserves to be unforgettable.";
  const heroDescription =
    eventsHero?.subheading ??
    "Personal loss, family memory, and gatherings that honor who they were.";

  return (
    <div
      className="min-h-screen overflow-hidden bg-background text-foreground"
      style={heroStudioCssVars(heroFrame) as CSSProperties}
    >
      {heroImageSrc ? (
      <FullBleedHero
        imageSrc={heroImageSrc}
        imageAlt={heroImageAlt}
        frame={heroFrame}
      >
        <div className={cn(siteHeroCopyBlockLeft, "max-w-xl")} style={heroCopyOffsetStyle(heroFrame)}>
          <SectionHeader
            eyebrow="Events"
            title={heroTitle}
            description={heroDescription}
            variant="dark"
          />
        </div>
      </FullBleedHero>
      ) : null}
      <main className="space-y-16 pb-24 pt-12 lg:space-y-20 lg:pb-32">
        <section className="mx-auto max-w-6xl px-6">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
              <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
            </div>
          ) : liveEvents.length > 0 ? (
            <LiveEventsRow events={liveEvents} />
          ) : (
            <EmptyState
              title="No live events yet"
              description="Live productions will appear here with links to streams and memoir experiences."
            />
          )}
        </section>

        <section className="mx-auto max-w-6xl px-6">
          {loading ? (
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[300px] w-[200px] shrink-0 animate-pulse rounded-xl bg-white/5"
                />
              ))}
            </div>
          ) : stories.length > 0 ? (
            <TrendingStoriesRow stories={stories} />
          ) : (
            <EmptyState
              title="Stories coming soon"
              description="Trending legacy stories will appear in a scrollable row — edit them anytime in Supabase event_stories."
            />
          )}
        </section>
      </main>
      <Footer />
      {studioPanel ? (
        <HeroLayoutStudioPanel page="events" frame={heroFrame} onChange={setHeroFrame} />
      ) : null}
    </div>
  );
};

export default Events;
