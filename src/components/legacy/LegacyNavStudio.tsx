import { useState, type CSSProperties, type ReactNode } from "react";

import { FloatingStudioShell } from "@/components/dev/FloatingStudioShell";

import {
  StudioAccordionPanels,
  StudioAccordionSection,
} from "@/components/dev/StudioAccordionSection";

import { StudioTextEditButton } from "@/components/dev/StudioTextEditButton";

import { StudioSlider } from "@/components/dev/StudioSlider";

import { isLayoutStudioEnabled } from "@/lib/layoutStudio";

import {

  LEGACY_NAV_STUDIO_DEFAULTS,

  loadLegacyNavStudioFrame,

  legacyNavStudioStyle,

  saveLegacyNavStudioFrame,

  type LegacyNavStudioFrame,

} from "@/lib/legacyNavStudio";

import { cn } from "@/lib/utils";



type Props = {

  children: ReactNode;

  className?: string;

  /** Record vertical rail — position anywhere across viewport width */

  recordOverlay?: boolean;

};



export function LegacyNavStudio({ children, className, recordOverlay = false }: Props) {

  const studioEnabled = isLayoutStudioEnabled();

  const [frame, setFrame] = useState<LegacyNavStudioFrame>(() => loadLegacyNavStudioFrame());

  const [open, setOpen] = useState(true);



  const patch = (partial: Partial<LegacyNavStudioFrame>) => {
    const next = { ...frame, ...partial };
    setFrame(next);
    saveLegacyNavStudioFrame(next);
  };

  const appliedFrame = frame;



  const labelLiftStyle: CSSProperties | undefined =

    appliedFrame.labelLiftVh > 0

      ? { ["--legacy-nav-label-lift" as string]: `${appliedFrame.labelLiftVh}vh` }

      : undefined;



  return (

    <>

      <div

        className={cn("legacy-nav-studio", recordOverlay ? "w-auto max-w-none" : "mx-auto w-full", className)}

        style={{ ...legacyNavStudioStyle(appliedFrame, { recordRail: recordOverlay }), ...labelLiftStyle }}

      >

        {children}

      </div>



      {studioEnabled ? (

        <FloatingStudioShell

          panelId="legacy-tab-nav"

          open={open}

          onOpen={() => setOpen(true)}

          onClose={() => setOpen(false)}

          openButtonLabel={recordOverlay ? "Nav rail" : "Tab bar"}

        >

          <p className="mb-3 text-[9px] leading-snug text-muted-foreground">
            {recordOverlay
              ? "← / → and ↑ / ↓ are % of the viewport (0–100). Fine offset adds vw/vh on top."
              : "Fine-tune the tab row within site bounds. Shifts use % of the bar size."}
          </p>

          <StudioTextEditButton />

          <StudioAccordionPanels defaultValue={["position"]}>
            <StudioAccordionSection
              value="position"
              title={recordOverlay ? "Rail position" : "Tab bar position"}
            >
            {recordOverlay ? (

              <>

                <StudioSlider

                  compact

                  label="Rail position ← / → (% viewport)"

                  value={frame.offsetXPercent}

                  defaultValue={LEGACY_NAV_STUDIO_DEFAULTS.offsetXPercent}

                  min={0}

                  max={100}

                  step={0.5}

                  displayValue={`${frame.offsetXPercent}%`}

                  onChange={(v) => patch({ offsetXPercent: v })}

                />

                <StudioSlider

                  compact

                  label="Rail position ↑ / ↓ (% viewport)"

                  value={frame.offsetYPercent}

                  defaultValue={LEGACY_NAV_STUDIO_DEFAULTS.offsetYPercent}

                  min={0}

                  max={100}

                  step={0.5}

                  displayValue={`${frame.offsetYPercent}%`}

                  onChange={(v) => patch({ offsetYPercent: v })}

                />

                <StudioSlider

                  compact

                  label="Fine offset ← / → (vw)"

                  value={frame.offsetXVw}

                  defaultValue={LEGACY_NAV_STUDIO_DEFAULTS.offsetXVw}

                  min={-20}

                  max={20}

                  step={0.5}

                  displayValue={`${frame.offsetXVw}vw`}

                  onChange={(v) => patch({ offsetXVw: v })}

                />

                <StudioSlider

                  compact

                  label="Fine offset ↑ / ↓ (vh)"

                  value={frame.offsetYVh}

                  defaultValue={LEGACY_NAV_STUDIO_DEFAULTS.offsetYVh}

                  min={-20}

                  max={20}

                  step={0.5}

                  displayValue={`${frame.offsetYVh}vh`}

                  onChange={(v) => patch({ offsetYVh: v })}

                />

              </>

            ) : (

              <>

                <StudioSlider

                  compact

                  label="Move tab bar ← / → (%)"

                  value={frame.tabShiftXPercent}

                  defaultValue={LEGACY_NAV_STUDIO_DEFAULTS.tabShiftXPercent}

                  min={-25}

                  max={25}

                  step={0.5}

                  displayValue={`${frame.tabShiftXPercent}%`}

                  onChange={(v) => patch({ tabShiftXPercent: v })}

                />

                <StudioSlider

                  compact

                  label="Move tab bar ↑ / ↓ (%)"

                  value={frame.tabShiftYPercent}

                  defaultValue={LEGACY_NAV_STUDIO_DEFAULTS.tabShiftYPercent}

                  min={-25}

                  max={25}

                  step={0.5}

                  displayValue={`${frame.tabShiftYPercent}%`}

                  onChange={(v) => patch({ tabShiftYPercent: v })}

                />

              </>

            )}
            </StudioAccordionSection>

            <StudioAccordionSection value="size" title="Labels & width">
            <StudioSlider

              compact

              label="Lift tab labels ↑ (vh)"

              value={frame.labelLiftVh}

              defaultValue={LEGACY_NAV_STUDIO_DEFAULTS.labelLiftVh}

              min={0}

              max={3}

              step={0.1}

              displayValue={`${frame.labelLiftVh}vh`}

              onChange={(v) => patch({ labelLiftVh: v })}

            />

            <StudioSlider

              compact

              label="Tab bar width (rem)"

              value={frame.maxWidthRem}

              defaultValue={LEGACY_NAV_STUDIO_DEFAULTS.maxWidthRem}

              min={16}

              max={48}

              step={0.5}

              onChange={(v) => patch({ maxWidthRem: v })}

            />
            </StudioAccordionSection>

            <StudioAccordionSection value="data" title="Import & export">
          <button

            type="button"

            onClick={() =>

              patch(

                recordOverlay

                  ? {

                      offsetXPercent: LEGACY_NAV_STUDIO_DEFAULTS.offsetXPercent,

                      offsetYPercent: LEGACY_NAV_STUDIO_DEFAULTS.offsetYPercent,

                      offsetXVw: 0,

                      offsetYVh: 0,

                    }

                  : {

                      tabShiftXPercent: 0,

                      tabShiftYPercent: 0,

                    },

              )

            }

            className="w-full rounded-md bg-primary/15 py-2 text-[10px] font-semibold uppercase tracking-widest text-primary hover:bg-primary/25"

          >

            Reset position

          </button>

          <div className="flex gap-2">

            <button

              type="button"

              onClick={() => {

                const json = JSON.stringify(frame, null, 2);

                void navigator.clipboard.writeText(json).then(() => alert("Nav JSON copied!"));

              }}

              className="flex-1 rounded-md border border-border py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"

            >

              Copy JSON

            </button>

            <button

              type="button"

              onClick={() => {

                setFrame({ ...LEGACY_NAV_STUDIO_DEFAULTS });

                saveLegacyNavStudioFrame(LEGACY_NAV_STUDIO_DEFAULTS);

              }}

              className="rounded-md border border-border px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"

            >

              Reset

            </button>

          </div>
            </StudioAccordionSection>
          </StudioAccordionPanels>

        </FloatingStudioShell>

      ) : null}

    </>

  );

}

