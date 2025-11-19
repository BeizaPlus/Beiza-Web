import { ArrowUpRight, MapPin, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemoirTimelineEntry } from "@/types/memoir";

type TimelineStoryCardProps = {
  entry: MemoirTimelineEntry;
  orientation?: "left" | "right";
  onSelect?: (entry: MemoirTimelineEntry) => void;
};

export const TimelineStoryCard = ({ entry, orientation = "right", onSelect }: TimelineStoryCardProps) => {
  const handleSelect = () => {
    if (onSelect)
    {
      onSelect(entry);
    }
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-lg border border-white/10 bg-white/5 p-6 text-left text-white shadow-glass transition hover:-translate-y-1 hover:bg-white/10 hover:shadow-xl",
        "backdrop-blur",
        orientation === "left" ? "lg:mr-14" : "lg:ml-14"
      )}
    >
      <div className="overflow-hidden rounded-lg border border-white/10">
        <div className="relative aspect-[3/2] w-full overflow-hidden">
          <img
            src={entry.image.src}
            alt={entry.image.alt}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
        <span className="rounded-full bg-white/10 px-3 py-1">{entry.eraLabel ?? "Moments"}</span>
        <time dateTime={entry.timestamp} className="rounded-full bg-white/5 px-3 py-1">
          {new Date(entry.timestamp).toLocaleDateString(undefined, { year: "numeric", month: "short" })}
        </time>
        {entry.endTimestamp ? (
          <time dateTime={entry.endTimestamp} className="rounded-full bg-white/5 px-3 py-1">
            {new Date(entry.endTimestamp).toLocaleDateString(undefined, { year: "numeric", month: "short" })}
          </time>
        ) : null}
      </div>

      <div>
        <h3 className="text-2xl font-semibold leading-snug text-white">{entry.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/80">{entry.excerpt}</p>
      </div>

      <dl className="flex flex-wrap items-center gap-3 text-xs text-white/70">
        {entry.location ? (
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            <span>{entry.location}</span>
          </div>
        ) : null}
        {entry.tags?.map((tag) => (
          <div key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            #{tag}
          </div>
        ))}
        {entry.participants?.length ? (
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            With {entry.participants.join(", ")}
          </div>
        ) : null}
      </dl>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        {entry.storyUrl ? (
          <a
            href={entry.storyUrl}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Read the full story <ArrowUpRight className="h-4 w-4" />
          </a>
        ) : null}

        {entry.audioClipUrl ? (
          <button
            type="button"
            onClick={handleSelect}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <Play className="h-4 w-4" />
            Listen
          </button>
        ) : null}
      </div>
    </article>
  );
};

