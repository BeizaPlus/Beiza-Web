import { useRecordLayoutStudio } from "@/context/RecordLayoutStudioContext";
import { FloatingStudioShell } from "@/components/dev/FloatingStudioShell";
import { useStudioPanel } from "@/hooks/useStudioPanel";
import { HeritageHeroStudioControls } from "@/components/dev/HeritageHeroStudioControls";
import { StudioJsonCopyBlock } from "@/components/dev/StudioJsonCopyBlock";
import {
  StudioAccordionPanels,
  StudioAccordionSection,
} from "@/components/dev/StudioAccordionSection";
import { StudioTextEditButton } from "@/components/dev/StudioTextEditButton";
import { StudioCopyOffsetSliders } from "@/components/dev/StudioCopyOffsetSliders";
import { StudioSlider } from "@/components/dev/StudioSlider";
import { useLayoutStudioBreakpoint } from "@/hooks/useLayoutStudioViewport";
import { layoutBreakpointLabel, type LayoutStudioBreakpoint } from "@/lib/layoutBreakpoints";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import {
  RECORD_PAGE_PHONE_DEFAULTS,
  RECORD_PAGE_STUDIO_DEFAULTS,
  RECORD_PAGE_TABLET_DEFAULTS,
  recordPageFrameForViewport,
  recordPageStudioToJson,
  saveRecordPageStudioFrame,
  type RecordPageStudioFrame,
} from "@/lib/legacy/recordPageStudio";

type Props = {
  frame: RecordPageStudioFrame;
  onChange: (frame: RecordPageStudioFrame) => void;
};

function tierSliders(
  breakpoint: LayoutStudioBreakpoint,
  frame: RecordPageStudioFrame,
  active: RecordPageStudioFrame,
  patch: (partial: Partial<RecordPageStudioFrame>) => void,
) {
  if (breakpoint === "desktop") {
    const defaults = RECORD_PAGE_STUDIO_DEFAULTS;
    return (
      <>
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
      </>
    );
  }

  if (breakpoint === "tablet") {
    const t = RECORD_PAGE_TABLET_DEFAULTS;
    return (
      <>
        <StudioSlider
          compact
          label="Column width (rem)"
          value={frame.columnMaxWidthRemTablet}
          defaultValue={t.columnMaxWidthRemTablet}
          min={18}
          max={32}
          step={0.25}
          displayValue={`${active.columnMaxWidthRem}rem live`}
          onChange={(columnMaxWidthRemTablet) => patch({ columnMaxWidthRemTablet })}
        />
        <StudioSlider
          compact
          label="Inner indent (rem)"
          value={frame.contentIndentRemTablet}
          defaultValue={t.contentIndentRemTablet}
          min={0}
          max={2}
          step={0.125}
          displayValue={`${frame.contentIndentRemTablet}rem`}
          onChange={(contentIndentRemTablet) => patch({ contentIndentRemTablet })}
        />
        <StudioSlider
          compact
          label="Email field width (rem)"
          value={frame.emailMaxWidthRemTablet}
          defaultValue={t.emailMaxWidthRemTablet}
          min={16}
          max={28}
          step={0.25}
          displayValue={`${frame.emailMaxWidthRemTablet}rem`}
          onChange={(emailMaxWidthRemTablet) => patch({ emailMaxWidthRemTablet })}
        />
      </>
    );
  }

  const p = RECORD_PAGE_PHONE_DEFAULTS;
  return (
    <>
      <StudioSlider
        compact
        label="Column width (rem)"
        value={frame.columnMaxWidthRemPhone}
        defaultValue={p.columnMaxWidthRemPhone}
        min={14}
        max={28}
        step={0.25}
        displayValue={`${active.columnMaxWidthRem}rem live`}
        onChange={(columnMaxWidthRemPhone) => patch({ columnMaxWidthRemPhone })}
      />
      <StudioSlider
        compact
        label="Inner indent (rem)"
        value={frame.contentIndentRemPhone}
        defaultValue={p.contentIndentRemPhone}
        min={0}
        max={1.5}
        step={0.125}
        displayValue={`${frame.contentIndentRemPhone}rem`}
        onChange={(contentIndentRemPhone) => patch({ contentIndentRemPhone })}
      />
      <StudioSlider
        compact
        label="Email field width (rem)"
        value={frame.emailMaxWidthRemPhone}
        defaultValue={p.emailMaxWidthRemPhone}
        min={14}
        max={26}
        step={0.25}
        displayValue={`${frame.emailMaxWidthRemPhone}rem`}
        onChange={(emailMaxWidthRemPhone) => patch({ emailMaxWidthRemPhone })}
      />
    </>
  );
}

export function RecordPageStudioPanel({ frame, onChange }: Props) {
  const studioEnabled = isLayoutStudioEnabled();
  const ctx = useRecordLayoutStudio();
  const breakpoint = useLayoutStudioBreakpoint();
  const panel = useStudioPanel("record-page");
  const active = recordPageFrameForViewport(frame, breakpoint);

  if (!studioEnabled) return null;

  const patch = (partial: Partial<RecordPageStudioFrame>) => {
    const next = { ...frame, ...partial };
    onChange(next);
    saveRecordPageStudioFrame(next);
  };

  return (
    <FloatingStudioShell
      panelId="record-page"
      open={panel.open}
      onOpen={panel.onOpen}
      onClose={panel.onClose}
      openButtonLabel="Record page"
    >
      <p className="mb-2 text-[9px] leading-snug text-muted-foreground">
        Click the record page (hero + column) to open this panel. Adjust column, email width, and hero image.
      </p>
      <p className="mb-3 rounded-md border border-primary/30 bg-primary/10 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
        Editing: {layoutBreakpointLabel(breakpoint)}
      </p>

      <StudioTextEditButton />

      <StudioAccordionPanels defaultValue="copy">
        <StudioAccordionSection
          value="copy"
          title={`${layoutBreakpointLabel(breakpoint)} · copy & sign-in`}
        >
          {tierSliders(breakpoint, frame, active, patch)}
        </StudioAccordionSection>

        <StudioAccordionSection value="hero" title="Hero image">
          <HeritageHeroStudioControls frame={frame} onPatch={(partial) => patch(partial)} />
        </StudioAccordionSection>

        <StudioAccordionSection value="data" title="Import & export">
          <StudioJsonCopyBlock
            getJson={() => recordPageStudioToJson(frame)}
            onReset={() => {
              onChange({ ...RECORD_PAGE_STUDIO_DEFAULTS });
              saveRecordPageStudioFrame(RECORD_PAGE_STUDIO_DEFAULTS);
            }}
          />
        </StudioAccordionSection>
      </StudioAccordionPanels>
    </FloatingStudioShell>
  );
}
