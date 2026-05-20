import { Fragment, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { TimelineStoryCard } from "./TimelineStoryCard";
import {
  resolveTimelineEntryImage,
  type GalleryImagePoolItem,
} from "@/lib/memoir/timelineImages";
import { cn } from "@/lib/utils";
import type { MemoirTimelineEntry } from "@/types/memoir";

type UnifiedTimelineProps = {
  entries: MemoirTimelineEntry[];
  isLoading?: boolean;
  galleryPool?: GalleryImagePoolItem[];
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
        <div className="h-[320px] w-full animate-pulse rounded-lg bg-white/5 lg:max-w-[520px]" />
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="rounded-lg border border-white/10 bg-white/5 p-12 text-center text-white/70">
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
    if (bucket) {
      bucket.push(entry);
    } else {
      grouping.set(label, [entry]);
    }
  });

  return grouping;
}

type EraSectionProps = {
  label: string;
  groupEntries: MemoirTimelineEntry[];
  globalEntryOffset: number;
  galleryPool: GalleryImagePoolItem[];
  defaultOpen: boolean;
  onEntrySelect?: (entry: MemoirTimelineEntry) => void;
};

function EraSection({
  label,
  groupEntries,
  globalEntryOffset,
  galleryPool,
  defaultOpen,
  onEntrySelect,
}: EraSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-white/5"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
          {label}
        </span>
        <span className="text-xs text-white/40">
          {groupEntries.length} {groupEntries.length === 1 ? "chapter" : "chapters"}
        </span>
        <span className="ml-auto h-px flex-1 bg-white/10" />
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-white/50 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="border-t border-white/10 px-2 pb-8 pt-4 sm:px-4">
          <div className="flex flex-col gap-16">
            {groupEntries.map((entry, index) => {
              const orientation = index % 2 === 0 ? "left" : "right";
              const entryIndex = globalEntryOffset + index;
              const image = resolveTimelineEntryImage(entry, entryIndex, galleryPool);

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
                      <TimelineStoryCard
                        entry={entry}
                        image={image}
                        orientation={orientation}
                        onSelect={onEntrySelect}
                      />
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export const UnifiedTimeline = ({
  entries,
  isLoading,
  galleryPool = [],
  onEntrySelect,
}: UnifiedTimelineProps) => {
  const groups = useMemo(
    () => (entries.length ? Array.from(groupByEra(entries).entries()) : []),
    [entries],
  );

  const eraOffsets = useMemo(() => {
    const offsets: number[] = [];
    let running = 0;
    for (const [, groupEntries] of groups) {
      offsets.push(running);
      running += groupEntries.length;
    }
    return offsets;
  }, [groups]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!entries.length) {
    return <EmptyState />;
  }

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 py-8">
      <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-white/40 via-white/20 to-transparent lg:block" />

      {groups.map(([label, groupEntries], groupIndex) => (
        <EraSection
          key={label}
          label={label}
          groupEntries={groupEntries}
          globalEntryOffset={eraOffsets[groupIndex] ?? 0}
          galleryPool={galleryPool}
          defaultOpen={groupIndex === 0}
          onEntrySelect={onEntrySelect}
        />
      ))}
    </div>
  );
};


