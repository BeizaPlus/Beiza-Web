import { FloatingStudioShell } from "@/components/dev/FloatingStudioShell";
import { useStudioPanel } from "@/hooks/useStudioPanel";
import { StudioJsonCopyBlock } from "@/components/dev/StudioJsonCopyBlock";
import {
  StudioAccordionPanels,
  StudioAccordionSection,
} from "@/components/dev/StudioAccordionSection";
import { StudioCopyOffsetSliders } from "@/components/dev/StudioCopyOffsetSliders";
import { useRecordLayoutStudio } from "@/context/RecordLayoutStudioContext";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import {
  LEGACY_NAV_TAB_LABELS,
  LEGACY_NAV_TAB_STUDIO_DEFAULTS,
  saveLegacyNavTabStudioFrame,
  type LegacyNavTabHref,
  type LegacyNavTabStudioFrame,
} from "@/lib/legacy/legacyNavTabStudio";

type Props = {
  frame: LegacyNavTabStudioFrame;
  onChange: (frame: LegacyNavTabStudioFrame) => void;
};

function tabFromTarget(target: string | null): LegacyNavTabHref | null {
  if (!target?.startsWith("nav-tab:")) return null;
  const href = target.slice("nav-tab:".length);
  return href in LEGACY_NAV_TAB_LABELS ? (href as LegacyNavTabHref) : null;
}

export function LegacyNavTabStudioPanel({ frame, onChange }: Props) {
  const studioEnabled = isLayoutStudioEnabled();
  const ctx = useRecordLayoutStudio();
  const panel = useStudioPanel("legacy-nav-tabs");
  const activeHref = tabFromTarget(ctx?.activeTarget ?? null);

  if (!studioEnabled) return null;

  const patchTab = (href: LegacyNavTabHref, partial: Partial<LegacyNavTabStudioFrame[LegacyNavTabHref]>) => {
    const next = { ...frame, [href]: { ...frame[href], ...partial } };
    onChange(next);
    saveLegacyNavTabStudioFrame(next);
  };

  const editingLabel =
    activeHref != null
      ? `Tab · ${LEGACY_NAV_TAB_LABELS[activeHref]}`
      : ctx?.activeTarget === "nav-rail"
        ? "Whole rail (use Nav rail panel)"
        : "Click a tab icon on the rail";

  return (
    <FloatingStudioShell
      panelId="legacy-nav-tabs"
      open={panel.open}
      onOpen={panel.onOpen}
      onClose={panel.onClose}
      openButtonLabel="Tab icons"
    >
      <p className="mb-2 text-[9px] leading-snug text-muted-foreground">
        Click a tab icon to edit its position. Shift+click still adjusts without leaving the page.
      </p>
      <p className="mb-3 rounded-md border border-primary/30 bg-primary/10 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
        {editingLabel}
      </p>

      <StudioAccordionPanels defaultValue="offset">
        <StudioAccordionSection value="offset" title="Selected tab icon">
          {activeHref ? (
            <StudioCopyOffsetSliders
              frame={frame[activeHref]}
              defaults={LEGACY_NAV_TAB_STUDIO_DEFAULTS[activeHref]}
              onPatch={(partial) => patchTab(activeHref, partial)}
            />
          ) : (
            <p className="text-[10px] text-muted-foreground">
              No tab selected — tap an icon on the legacy rail (studio mode).
            </p>
          )}
        </StudioAccordionSection>

        <StudioAccordionSection value="data" title="Import & export">
          <StudioJsonCopyBlock
            getJson={() =>
              JSON.stringify(
                {
                  savedAt: new Date().toISOString(),
                  LEGACY_NAV_TAB_STUDIO_DEFAULTS: frame,
                },
                null,
                2,
              )
            }
            onReset={() => {
              onChange({ ...LEGACY_NAV_TAB_STUDIO_DEFAULTS });
              saveLegacyNavTabStudioFrame(LEGACY_NAV_TAB_STUDIO_DEFAULTS);
            }}
          />
        </StudioAccordionSection>
      </StudioAccordionPanels>
    </FloatingStudioShell>
  );
}
