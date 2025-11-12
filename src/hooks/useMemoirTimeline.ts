import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { parseISO, compareAsc } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import type { MemoirTimelineEntry } from "@/types/memoir";


type TimelineQueryKey = ["memoir-timeline", string];

const queryKey = (slug: string): TimelineQueryKey => ["memoir-timeline", slug];

type TimelineRow = {
  id: string;
  memoir_slug: string;
  era_label: string | null;
  title: string;
  excerpt: string;
  story_url: string | null;
  timestamp: string;
  end_timestamp: string | null;
  location: string | null;
  tags: string[] | null;
  participants: string[] | null;
  image: {
    src: string;
    alt: string;
    placeholder?: string | null;
  } | null;
  audio_clip_url: string | null;
  is_published: boolean;
  display_order: number | null;
};

function normalizeEntry(row: TimelineRow): MemoirTimelineEntry {
  return {
    id: row.id,
    memoirId: row.memoir_slug,
    eraLabel: row.era_label ?? undefined,
    title: row.title,
    excerpt: row.excerpt,
    storyUrl: row.story_url ?? undefined,
    timestamp: row.timestamp,
    endTimestamp: row.end_timestamp ?? undefined,
    location: row.location ?? undefined,
    tags: row.tags ?? undefined,
    participants: row.participants ?? undefined,
    image: row.image
      ? {
          src: row.image.src,
          alt: row.image.alt,
          placeholder: row.image.placeholder ?? undefined,
        }
      : {
          src: "",
          alt: "",
        },
    audioClipUrl: row.audio_clip_url ?? undefined,
    isPublished: row.is_published,
    displayOrder: row.display_order ?? Number.MAX_SAFE_INTEGER,
  };
}

async function fetchTimelineEntries(slug: string): Promise<MemoirTimelineEntry[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("memoir_timelines")
    .select("*")
    .eq("memoir_slug", slug)
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (error) {
    // eslint-disable-next-line no-console
    console.warn("[memoir timeline] Error fetching timeline entries:", error.message);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  return (data as TimelineRow[]).map(normalizeEntry);
}

function sortEntries(entries: MemoirTimelineEntry[]) {
  return [...entries].sort((a, b) => {
    if (a.displayOrder !== undefined && b.displayOrder !== undefined && a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }

    return compareAsc(parseISO(a.timestamp), parseISO(b.timestamp));
  });
}

export const useMemoirTimeline = (memoirSlug: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKey(memoirSlug),
    queryFn: () => fetchTimelineEntries(memoirSlug),
    staleTime: 1000 * 60 * 5,
  });

  const timeline = useMemo(() => (data ? sortEntries(data) : []), [data]);

  return {
    entries: timeline,
    isLoading,
    error,
  };
};

