import { useState } from "react";
import { FloatingStudioShell } from "@/components/dev/FloatingStudioShell";
import { HeritageHeroStudioControls } from "@/components/dev/HeritageHeroStudioControls";
import { StudioJsonCopyBlock } from "@/components/dev/StudioJsonCopyBlock";
import { StudioTextEditButton } from "@/components/dev/StudioTextEditButton";
import { StudioCopyOffsetSliders } from "@/components/dev/StudioCopyOffsetSliders";
import { StudioSlider } from "@/components/dev/StudioSlider";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import {
  RECORD_PAGE_STUDIO_DEFAULTS,
  recordPageStudioToJson,
  saveRecordPageStudioFrame,
  type RecordPageStudioFrame,
} from "@/lib/legacy/recordPageStudio";

type Props = {
  frame: RecordPageStudioFrame;
  onChange: (frame: RecordPageStudioFrame) => void;
};

export function RecordPageStudioPanel({ frame, onChange }: Props) {
  const studioEnabled = isLayoutStudioEnabled();
  const [open, setOpen] = useState(true);
  const defaults = RECORD_PAGE_STUDIO_DEFAULTS;

  if (!studioEnabled) return null;

  const patch = (partial: Partial<RecordPageStudioFrame>) => {
    const next = { ...frame, ...partial };
    onChange(next);
    saveRecordPageStudioFrame(next);
  };

  return (
    <FloatingStudioShell
      panelId="record-page"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      openButtonLabel="Record page"
    >
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Record page
      </p>
      <p className="mb-3 text-[9px] leading-snug text-muted-foreground">
        Copy column, email width, inner indent, and hero image — live on /legacy/record.
      </p>

      <StudioTextEditButton />

      <p className="mb-2 mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/90">
        Copy & sign-in
      </p>
      <div className="space-y-3">
        <StudioCopyOffsetSliders frame={frame} defaults={defaults} onPatch={patch} />
        <StudioSlider
          compact
          label="Column width (rem)"
          value={frame.columnMaxWidthRem}
          defaultValue={defaults.columnMaxWidthRem}
          min={16}
          max={52}
          step={0.25}
          displayValue={`${frame.columnMaxWidthRem}rem`}
          onChange={(columnMaxWidthRem) => patch({ columnMaxWidthRem })}
        />
        <StudioSlider
          compact
          label="Inner indent (rem)"
          value={frame.contentIndentRem}
          defaultValue={defaults.contentIndentRem}
          min={0}
          max={20}
          step={0.25}
          displayValue={`${frame.contentIndentRem}rem`}
          onChange={(contentIndentRem) => patch({ contentIndentRem })}
        />
        <StudioSlider
          compact
          label="Email field width (rem)"
          value={frame.emailMaxWidthRem}
          defaultValue={defaults.emailMaxWidthRem}
          min={8}
          max={40}
          step={0.25}
          displayValue={`${frame.emailMaxWidthRem}rem`}
          onChange={(emailMaxWidthRem) => patch({ emailMaxWidthRem })}
        />
        <StudioSlider
          compact
          label="Subtitle width (rem)"
          value={frame.subtitleMaxWidthRem}
          defaultValue={defaults.subtitleMaxWidthRem}
          min={12}
          max={40}
          step={0.25}
          displayValue={`${frame.subtitleMaxWidthRem}rem`}
          onChange={(subtitleMaxWidthRem) => patch({ subtitleMaxWidthRem })}
        />
      </div>

      <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/90">
        Hero image
      </p>
      <HeritageHeroStudioControls
        frame={frame}
        onPatch={(partial) => patch(partial)}
      />

      <StudioJsonCopyBlock
        getJson={() => recordPageStudioToJson(frame)}
        onReset={() => {
          onChange({ ...RECORD_PAGE_STUDIO_DEFAULTS });
          saveRecordPageStudioFrame(RECORD_PAGE_STUDIO_DEFAULTS);
        }}
      />
    </FloatingStudioShell>
  );
}
