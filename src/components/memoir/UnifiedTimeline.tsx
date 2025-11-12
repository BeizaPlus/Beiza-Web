import { Fragment } from "react";
import { TimelineStoryCard } from "./TimelineStoryCard";
import type { MemoirTimelineEntry } from "@/types/memoir";

type UnifiedTimelineProps = {
  entries: MemoirTimelineEntry[];
  isLoading?: boolean;
  onEntrySelect?: (entry: MemoirTimelineEntry) => void;
};

const LoadingState = () => (
  <div className="flex flex-col gap-12">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="hidden shrink-0 items-center gap-4 lg:flex">
          <span className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
          <span className="h-24 w-1 shrink-0 animate-pulse rounded bg-white/10" />
        </div>
        <div className="h-[320px] w-full animate-pulse rounded-3xl bg-white/5 lg:max-w-[520px]" />
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-white/70">
    <h3 className="text-2xl font-semibold text-white">Timeline coming soon</h3>
    <p className="mt-3 text-sm leading-relaxed text-white/70">
      The memoir curators are preparing this chapter. Please check back shortly for new stories.
    </p>
  </div>
);

function groupByEra(entries: MemoirTimelineEntry[]) {
  const grouping = new Map<string, MemoirTimelineEntry[]>();

  entries.forEach((entry) => {
    const label = entry.eraLabel ?? "Highlights";
    const bucket = grouping.get(label);

    if (bucket)
    {
      bucket.push(entry);
    } else
    {
      grouping.set(label, [entry]);
    }
  });

  return grouping;
}

export const UnifiedTimeline = ({ entries, isLoading, onEntrySelect }: UnifiedTimelineProps) => {
  if (isLoading)
  {
    return <LoadingState />;
  }

  if (!entries.length)
  {
    return <EmptyState />;
  }

  const grouped = groupByEra(entries);
  const groups = Array.from(grouped.entries());

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-16 py-12">
      <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-white/40 via-white/20 to-transparent lg:block" />

      {groups.map(([label, groupEntries]) => (
        <section key={label} className="flex flex-col gap-10">
          <header className="flex items-center gap-3">
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
              {label}
            </span>
            <span className="h-px flex-1 bg-white/10" />
          </header>

          <div className="flex flex-col gap-16">
            {groupEntries.map((entry, index) => {
              const orientation = index % 2 === 0 ? "left" : "right";
              return (
                <Fragment key={entry.id}>
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                    <div className="relative hidden w-1/2 items-center justify-center lg:flex">
                      <div className="absolute left-1/2 flex h-full -translate-x-1/2 justify-center">
                        <span className="w-px flex-1 bg-white/10" />
                      </div>
                      <div className="relative flex items-center gap-6">
                        {orientation === "left" ? null : <span className="h-px w-16 bg-white/10" />}
                        <span className="h-10 w-10 rounded-full border border-white/20 bg-white/10 backdrop-blur">
                          <span className="sr-only">{new Date(entry.timestamp).toDateString()}</span>
                        </span>
                        {orientation === "left" ? <span className="h-px w-16 bg-white/10" /> : null}
                      </div>
                    </div>

                    <div className="flex w-full lg:w-1/2">
                      <TimelineStoryCard entry={entry} orientation={orientation} onSelect={onEntrySelect} />
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

