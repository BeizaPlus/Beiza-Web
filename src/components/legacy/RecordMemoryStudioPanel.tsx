import { useState } from "react";
import { FloatingStudioShell } from "@/components/dev/FloatingStudioShell";
import { StudioJsonCopyBlock } from "@/components/dev/StudioJsonCopyBlock";
import {
  StudioAccordionPanels,
  StudioAccordionSection,
} from "@/components/dev/StudioAccordionSection";
import { StudioCopyOffsetSliders } from "@/components/dev/StudioCopyOffsetSliders";
import { StudioSlider } from "@/components/dev/StudioSlider";
import { useRecordLayoutStudio } from "@/context/RecordLayoutStudioContext";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import {
  loadRecordMemoryStudioFrame,
  RECORD_MEMORY_STUDIO_DEFAULTS,
  RECORD_MEMORY_SUBSET_LABELS,
  recordMemoryStudioToJson,
  saveRecordMemoryStudioFrame,
  type RecordMemoryStudioFrame,
  type RecordMemorySubsetId,
} from "@/lib/legacy/recordMemoryStudio";

type Props = {
  frame: RecordMemoryStudioFrame;
  onChange: (frame: RecordMemoryStudioFrame) => void;
};

const SUBSET_TARGETS: Record<RecordMemorySubsetId, string> = {
  cta: "record-cta",
  playback: "record-playback",
  upload: "record-upload",
  seal: "record-seal",
};

function activeSubsetFromTarget(
  target: string | null,
): RecordMemorySubsetId | null {
  if (!target?.startsWith("record-")) return null;
  const entry = Object.entries(SUBSET_TARGETS).find(([, t]) => t === target);
  return entry ? (entry[0] as RecordMemorySubsetId) : null;
}

export function RecordMemoryStudioPanel({ frame, onChange }: Props) {
  const studioEnabled = isLayoutStudioEnabled();
  const ctx = useRecordLayoutStudio();
  const [open, setOpen] = useState(true);
  const activeId = activeSubsetFromTarget(ctx?.activeTarget ?? null);

  if (!studioEnabled) return null;

  const patch = (partial: Partial<RecordMemoryStudioFrame>) => {
    const next = { ...frame, ...partial };
    onChange(next);
    saveRecordMemoryStudioFrame(next);
  };

  const patchSubset = (id: RecordMemorySubsetId, partial: Partial<RecordMemoryStudioFrame["subsets"][RecordMemorySubsetId]>) => {
    const next = {
      ...frame,
      subsets: {
        ...frame.subsets,
        [id]: { ...frame.subsets[id], ...partial },
      },
    };
    onChange(next);
    saveRecordMemoryStudioFrame(next);
  };

  const editingLabel = activeId
    ? RECORD_MEMORY_SUBSET_LABELS[activeId]
    : "Click a HUD block on the page";

  return (
    <FloatingStudioShell
      panelId="record-memory-hud"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      openButtonLabel="Record HUD"
    >
      <p className="mb-2 text-[9px] leading-snug text-muted-foreground">
        Studio preview: no email sign-in. Click tabs to switch pages. Shift+click a HUD block here to nudge (vw / vh).
      </p>
      <p className="mb-3 rounded-md border border-primary/30 bg-primary/10 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
        {editingLabel}
      </p>

      <StudioAccordionPanels defaultValue={["inset", "subset"]}>
        <StudioAccordionSection value="inset" title="Station safe area">
          <StudioSlider
            compact
            label="Inset from sides (vw)"
            value={frame.stationInsetVw}
            defaultValue={RECORD_MEMORY_STUDIO_DEFAULTS.stationInsetVw}
            min={0}
            max={12}
            step={0.25}
            displayValue={`${frame.stationInsetVw}vw`}
            onChange={(stationInsetVw) => patch({ stationInsetVw })}
          />
          <StudioSlider
            compact
            label="Inset from bottom (vh)"
            value={frame.stationInsetBottomVh}
            defaultValue={RECORD_MEMORY_STUDIO_DEFAULTS.stationInsetBottomVh}
            min={0}
            max={20}
            step={0.25}
            displayValue={`${frame.stationInsetBottomVh}vh`}
            onChange={(stationInsetBottomVh) => patch({ stationInsetBottomVh })}
          />
        </StudioAccordionSection>

        <StudioAccordionSection value="subset" title="Selected block">
          {activeId ? (
            <StudioCopyOffsetSliders
              frame={frame.subsets[activeId]}
              defaults={RECORD_MEMORY_STUDIO_DEFAULTS.subsets[activeId]}
              onPatch={(partial) => patchSubset(activeId, partial)}
            />
          ) : (
            <p className="text-[10px] text-muted-foreground">
              No block selected — tap a highlighted region on the recording station.
            </p>
          )}
        </StudioAccordionSection>

        <StudioAccordionSection value="data" title="Import & export">
          <StudioJsonCopyBlock
            getJson={() => recordMemoryStudioToJson(frame)}
            onReset={() => {
              onChange({ ...RECORD_MEMORY_STUDIO_DEFAULTS });
              saveRecordMemoryStudioFrame(RECORD_MEMORY_STUDIO_DEFAULTS);
            }}
          />
        </StudioAccordionSection>
      </StudioAccordionPanels>
    </FloatingStudioShell>
  );
}
