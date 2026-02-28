import { type ReactNode, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { CTAButton } from "@/components/framer/CTAButton";
import { useFeaturedEvent, usePublishedEvents } from "@/hooks/usePublicContent";

const EmptyState = ({ title, description }: { title: string; description: ReactNode }) => (
  <div className="glass-panel flex flex-col items-center justify-center gap-4 rounded-[32px] border border-white/10 p-16 text-center text-white/70">
    <h2 className="text-2xl font-semibold text-white">{title}</h2>
    <p className="max-w-xl text-sm text-white/60">{description}</p>
  </div>
);

const Events = () => {
  const navigate = useNavigate();
  const { data: featuredEvent, isLoading: featuredLoading } = useFeaturedEvent();
  const { data: events = [], isLoading: eventsLoading } = usePublishedEvents();

  const primaryEvent = useMemo(() => {
    if (featuredEvent)
    {
      return featuredEvent;
    }
    return events[0] ?? null;
  }, [featuredEvent, events]);

  const additionalEvents = useMemo(() => {
    if (!primaryEvent)
    {
      return events;
    }
    return events.filter((event) => event.id !== primaryEvent.id);
  }, [events, primaryEvent]);

  const loading = featuredLoading || eventsLoading;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="space-y-24 pb-24 pt-28 lg:space-y-32 lg:pb-32">
        <section className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Events"
            title="Curated farewells that feel cinematic"
            description="Browse upcoming celebrations produced by the studio. Family collaborators can request access to private livestreams, itineraries, and media archives."
            align="center"
          />
        </section>

        <section className="mx-auto max-w-6xl px-6">
          {loading ? (
            <div className="glass-panel grid overflow-hidden rounded-[32px] border border-white/10 md:grid-cols-[1.05fr_0.95fr]">
              <div className="flex flex-col justify-between gap-6 p-8 md:p-12">
                <div className="space-y-4">
                  <div className="h-4 w-32 rounded-full bg-white/10" />
                  <div className="space-y-3">
                    <div className="h-12 w-3/4 rounded-full bg-white/10" />
                    <div className="h-4 w-full rounded-full bg-white/10" />
                    <div className="h-4 w-2/3 rounded-full bg-white/10" />
                  </div>
                </div>
                <div className="h-12 w-36 rounded-full bg-white/10" />
              </div>
              <div className="relative h-full bg-white/5" />
            </div>
          ) : primaryEvent ? (
            <div
              onClick={() => navigate(`/memoirs/${primaryEvent.memoirSlug}`)}
              className="glass-panel group cursor-pointer hover:border-white/20 transition-colors grid overflow-hidden rounded-[32px] border border-white/10 md:grid-cols-[1.05fr_0.95fr]"
            >
              <div className="flex flex-col justify-between gap-6 p-8 md:p-12">
                <div className="space-y-4">
                  <p className="text-eyebrow">Featured Tribute</p>
                  <h2 className="text-display-lg leading-[1.05] text-white">{primaryEvent.title}</h2>
                  {primaryEvent.description ? (
                    <p className="text-subtle text-base leading-relaxed">{primaryEvent.description}</p>
                  ) : null}
                  <p className="text-sm uppercase tracking-[0.3em] text-white/60">
                    {primaryEvent.location ?? "Location TBC"} • {primaryEvent.occursOn ?? "Date TBC"}
                  </p>
                </div>
                <CTAButton to={`/memoirs/${primaryEvent.memoirSlug}`} label="View memoirs" />
              </div>
              <div className="relative min-h-[400px] w-full md:min-h-full">
                {primaryEvent.heroMedia?.src && primaryEvent.heroMedia.src.trim() ? (
                  <img
                    src={primaryEvent.heroMedia.src}
                    alt={primaryEvent.heroMedia.alt ?? primaryEvent.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      console.error("[Events] Image failed to load:", primaryEvent.heroMedia?.src);
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector(".error-placeholder"))
                      {
                        const placeholder = document.createElement("div");
                        placeholder.className = "error-placeholder flex h-full min-h-[400px] w-full items-center justify-center bg-white/5 text-sm uppercase tracking-[0.3em] text-white/40";
                        placeholder.textContent = "Image unavailable";
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                ) : (
                  <div className="flex h-full min-h-[400px] w-full items-center justify-center bg-white/5 text-sm uppercase tracking-[0.3em] text-white/40">
                    Imagery coming soon
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No featured events yet"
              description="Once families approve upcoming celebrations, they will appear here with links to livestreams and programmes."
            />
          )}
        </section>

        <section className="mx-auto max-w-6xl px-6">
          <div className="space-y-12">
            <SectionHeader
              eyebrow="All Events"
              title="Celebrations"
              description="Families can request access to private itineraries, tribute rehearsals, and livestreams for these productions."
              align="center"
            />

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="glass-panel h-56 animate-pulse rounded-lg border border-white/10 bg-white/5" />
                ))}
              </div>
            ) : additionalEvents.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2">
                {additionalEvents.map((event) => (
                  <article
                    key={event.id}
                    onClick={() => navigate(`/memoirs/${event.memoirSlug}`)}
                    className="glass-panel group cursor-pointer hover:border-white/20 transition-colors flex h-full flex-col overflow-hidden rounded-lg border border-white/10"
                  >
                    {event.heroMedia?.src && event.heroMedia.src.trim() ? (
                      <div className="relative h-48 w-full overflow-hidden bg-black/20">
                        <img
                          src={event.heroMedia.src}
                          alt={event.heroMedia.alt ?? event.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            console.error("[Events] Image failed to load for event:", event.title, event.heroMedia?.src);
                            const target = e.currentTarget;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector(".error-placeholder"))
                            {
                              const placeholder = document.createElement("div");
                              placeholder.className = "error-placeholder flex h-full w-full items-center justify-center bg-white/5 text-xs uppercase tracking-[0.3em] text-white/40";
                              placeholder.textContent = "Image unavailable";
                              parent.appendChild(placeholder);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="relative h-48 w-full overflow-hidden bg-white/5">
                        <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/40">
                          No image
                        </div>
                      </div>
                    )}
                    <div className="flex flex-1 flex-col justify-between p-8">
                      <div className="space-y-3">
                        <p className="text-xs uppercase tracking-[0.3em] text-white/60">{event.location ?? "Location TBC"}</p>
                        <h3 className="text-2xl font-semibold text-white">{event.title}</h3>
                        {event.description ? <p className="text-sm text-white/70 line-clamp-3">{event.description}</p> : null}
                      </div>
                      <div className="mt-6 flex items-center justify-between text-sm text-white/60">
                        <span>{event.occursOn ? new Date(event.occursOn).toLocaleDateString() : "Date TBC"}</span>
                        <CTAButton to={`/memoirs/${event.memoirSlug}`} label="View memoirs" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : primaryEvent ? (
              <EmptyState
                title="No other events scheduled"
                description="The featured celebration is currently the only public event. As new experiences are confirmed, they’ll appear here automatically."
              />
            ) : (
              <EmptyState
                title="Events will appear here"
                description="The team is choreographing the next celebration. Check back soon for schedules, livestream links, and production notes."
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Events;

