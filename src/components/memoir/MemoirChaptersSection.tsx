import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { UnifiedTimeline } from "@/components/memoir/UnifiedTimeline";
import { MemoirJourney } from "@/components/memoir/MemoirJourney";
import { buildGalleryImagePool } from "@/lib/memoir/timelineImages";
import { segmentToggleOption, segmentToggleShell } from "@/lib/brandUi";
import { cn } from "@/lib/utils";
import type { MemoirHighlight, MemoirTimelineEntry, MemoirTimelineMedia } from "@/types/memoir";

export type MemoirChapterViewMode = "timeline" | "journey";

type MemoirChaptersSectionProps = {
  memoirTitle?: string;
  memoirSummary?: string;
  heroMedia?: MemoirTimelineMedia | null;
  highlights?: MemoirHighlight[];
  entries: MemoirTimelineEntry[];
  isLoading?: boolean;
};

const MODE_LABEL: Record<MemoirChapterViewMode, string> = {
  timeline: "Timeline",
  journey: "Journey",
};

function parseChapterMode(value: string | null): MemoirChapterViewMode {
  return value === "journey" ? "journey" : "timeline";
}

export function MemoirChaptersSection({
  memoirTitle,
  memoirSummary,
  heroMedia,
  highlights = [],
  entries,
  isLoading,
}: MemoirChaptersSectionProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const desiredMode = parseChapterMode(searchParams.get("chapters"));
  const [mode, setMode] = useState<MemoirChapterViewMode>(desiredMode);

  useEffect(() => {
    setMode(desiredMode);
  }, [desiredMode]);

  const galleryPool = useMemo(
    () => buildGalleryImagePool(highlights, heroMedia),
    [highlights, heroMedia],
  );

  const setChapterMode = (next: MemoirChapterViewMode) => {
    setMode(next);
    const params = new URLSearchParams(searchParams);
    if (next === "timeline") {
      params.delete("chapters");
    } else {
      params.set("chapters", next);
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <section className="pt-12">
      <SectionHeader
        eyebrow="Chapters"
        title={memoirTitle ? `Chapters of ${memoirTitle}` : "Life chapters"}
        description={
          memoirSummary ??
          "Read depth by era, or sweep through her life in images — gallery photos fill in until service photography is uploaded."
        }
        align="center"
      />

      <div className="mt-10 flex justify-center">
        <div
          className={cn(segmentToggleShell, "border-white/10 bg-white/5")}
          role="tablist"
          aria-label="Chapter view"
        >
          {(["timeline", "journey"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              className={segmentToggleOption(mode === key)}
              onClick={() => setChapterMode(key)}
            >
              {MODE_LABEL[key]}
            </button>
          ))}
        </div>
      </div>

      <p className="mx-auto mt-4 max-w-xl text-center text-xs leading-relaxed text-subtle">
        {mode === "timeline"
          ? "Vertical timeline — expand or collapse each era to read in depth."
          : "Horizontal journey — drag or scroll for a quick visual sweep of her life."}
      </p>

      <div className="mt-12">
        {mode === "timeline" ? (
          <UnifiedTimeline entries={entries} isLoading={isLoading} galleryPool={galleryPool} />
        ) : (
          <MemoirJourney entries={entries} isLoading={isLoading} galleryPool={galleryPool} />
        )}
      </div>
    </section>
  );
}
