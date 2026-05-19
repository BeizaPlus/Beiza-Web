import { Link } from "react-router-dom";
import type { PublicEvent } from "@/hooks/usePublicContent";
import { cn } from "@/lib/utils";

type LiveEventsRowProps = {
  events: PublicEvent[];
  className?: string;
};

export function LiveEventsRow({ events, className }: LiveEventsRowProps) {
  if (events.length === 0) return null;

  return (
    <section className={cn("space-y-6", className)} aria-label="Live events">
      <div>
        <p className="text-eyebrow text-primary">Live now</p>
        <h2 className="mt-2 text-display-lg text-white">Celebrations in production</h2>
        <p className="mt-2 max-w-2xl text-sm text-subtle">
          Join families with private livestreams, itineraries, and archival access as productions
          unfold.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {events.map((event) => (
          <Link
            key={event.id}
            to={`/memoirs/${event.memoirSlug ?? event.slug}`}
            className="glass-panel group grid overflow-hidden rounded-2xl border border-white/10 transition hover:border-primary/40 md:grid-cols-[1fr_1.1fr]"
          >
            <div className="flex flex-col justify-between gap-4 p-6 md:p-8">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  Live
                </span>
                <h3 className="text-xl font-semibold text-white md:text-2xl">{event.title}</h3>
                {event.subtitle ? (
                  <p className="text-sm text-subtle">{event.subtitle}</p>
                ) : event.description ? (
                  <p className="line-clamp-2 text-sm text-subtle">{event.description}</p>
                ) : null}
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {event.location ?? "Location TBC"}
                  {event.durationLabel ? ` · ${event.durationLabel}` : ""}
                </p>
              </div>
              <span className="text-sm font-medium text-primary group-hover:underline">
                View experience →
              </span>
            </div>
            <div className="relative min-h-[220px] bg-black/40 md:min-h-full">
              {event.heroMedia?.src ? (
                <img
                  src={event.heroMedia.src}
                  alt={event.heroMedia.alt ?? event.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full min-h-[220px] items-center justify-center text-xs uppercase tracking-widest text-white/30">
                  Imagery coming soon
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
