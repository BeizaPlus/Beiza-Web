import { useEffect, useState, type ReactNode } from "react";

import { SiteIndentGuides } from "@/components/dev/SiteIndentGuides";

import { FloatingStudioShell } from "@/components/dev/FloatingStudioShell";

import {

  StudioAccordionPanels,

  StudioAccordionSection,

} from "@/components/dev/StudioAccordionSection";

import { StudioSlider } from "@/components/dev/StudioSlider";

import { useLayoutStudio } from "@/context/LayoutStudioContext";

import { isLayoutStudioEnabled } from "@/lib/layoutStudio";

import { cn } from "@/lib/utils";

import {

  SITE_PADDING_DEFAULTS,

  applySitePaddingCssVar,

  loadIndentGuidesLive,

  loadSitePaddingFrame,

  saveIndentGuidesLive,

  saveSitePaddingFrame,

  siteContentIndentPx,

  sitePaddingPx,

  type SitePaddingFrame,

} from "@/lib/sitePaddingStudio";



type Props = {

  children: ReactNode;

};



/** Applies site layout CSS vars globally; panel on localhost / ?studio=1 */

export function SitePaddingStudioProvider({ children }: Props) {

  const [frame, setFrame] = useState<SitePaddingFrame>(() => loadSitePaddingFrame());

  const [draftIndentRem, setDraftIndentRem] = useState(() => loadSitePaddingFrame().contentIndentRem);

  const [guidesLive, setGuidesLive] = useState(() => loadIndentGuidesLive());

  const studioOn = isLayoutStudioEnabled();

  const { guidesVisible } = useLayoutStudio();

  const showGuides = studioOn && guidesVisible;

  const showHudPanels = studioOn;



  useEffect(() => {

    applySitePaddingCssVar(frame);

  }, [frame]);



  const patch = (partial: Partial<SitePaddingFrame>) => {

    const next = { ...frame, ...partial };

    setFrame(next);

    saveSitePaddingFrame(next);

    if (partial.contentIndentRem !== undefined) {

      setDraftIndentRem(partial.contentIndentRem);

    }

  };



  const onGuideIndentChange = (contentIndentRem: number) => {

    if (guidesLive) {

      patch({ contentIndentRem });

    } else {

      setDraftIndentRem(contentIndentRem);

    }

  };



  const applyDraftIndent = () => {

    patch({ contentIndentRem: draftIndentRem });

  };



  const setGuidesLiveMode = (live: boolean) => {

    setGuidesLive(live);

    saveIndentGuidesLive(live);

    if (live) {

      patch({ contentIndentRem: draftIndentRem });

    }

  };



  return (

    <>

      {children}

      {showGuides ? (

        <SiteIndentGuides

          frame={frame}

          draftIndentRem={draftIndentRem}

          live={guidesLive}

          onDraftIndentChange={onGuideIndentChange}

          onApplyIndent={applyDraftIndent}

          visible

        />

      ) : null}

      {showHudPanels ? (

        <SitePaddingStudioPanel

          frame={frame}

          draftIndentRem={draftIndentRem}

          guidesLive={guidesLive}

          onChange={patch}

          onDraftIndentChange={setDraftIndentRem}

          onGuidesLiveChange={setGuidesLiveMode}

        />

      ) : null}

    </>

  );

}



function SitePaddingStudioPanel({

  frame,

  draftIndentRem,

  guidesLive,

  onChange,

  onDraftIndentChange,

  onGuidesLiveChange,

}: {

  frame: SitePaddingFrame;

  draftIndentRem: number;

  guidesLive: boolean;

  onChange: (partial: Partial<SitePaddingFrame>) => void;

  onDraftIndentChange: (rem: number) => void;

  onGuidesLiveChange: (live: boolean) => void;

}) {

  const [open, setOpen] = useState(true);

  const px = sitePaddingPx(frame);

  const indentPx = siteContentIndentPx(frame);

  const previewPx = siteContentIndentPx({ ...frame, contentIndentRem: draftIndentRem });



  return (

    <FloatingStudioShell

      panelId="site-padding"

      open={open}

      onOpen={() => setOpen(true)}

      onClose={() => setOpen(false)}

      openButtonLabel="Site bounds"

    >

      <p className="mb-3 text-[9px] leading-snug text-muted-foreground">

        Yellow = site boundary. Cyan handles = inner indent. Heritage (/farewell) is the reference.

      </p>



      <StudioAccordionPanels defaultValue={["guides", "bounds"]}>

        <StudioAccordionSection

          value="guides"

          title="Cyan guides"

          hint={

            guidesLive

              ? "Dragging cyan lines moves hero copy immediately."

              : "Dragging only moves the rulers. Copy stays at applied indent until Live push."

          }

        >

          <div className="flex gap-1 rounded-lg border border-border p-0.5">

            <button

              type="button"

              onClick={() => onGuidesLiveChange(false)}

              className={cn(

                "flex-1 rounded-md py-1.5 text-[10px] font-semibold uppercase tracking-wide transition",

                !guidesLive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",

              )}

            >

              Measure only

            </button>

            <button

              type="button"

              onClick={() => onGuidesLiveChange(true)}

              className={cn(

                "flex-1 rounded-md py-1.5 text-[10px] font-semibold uppercase tracking-wide transition",

                guidesLive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",

              )}

            >

              Live push

            </button>

          </div>

        </StudioAccordionSection>



        <StudioAccordionSection value="bounds" title="Site bounds">

          <StudioSlider

            compact

            label="Boundary each side (rem)"

            value={frame.paddingXRem}

            defaultValue={SITE_PADDING_DEFAULTS.paddingXRem}

            min={0}

            max={8}

            step={0.25}

            displayValue={`${frame.paddingXRem}rem · ${px}px`}

            onChange={(v) => onChange({ paddingXRem: v })}

          />

          <StudioSlider

            compact

            label="Indent inside boundary (rem)"

            value={guidesLive ? frame.contentIndentRem : draftIndentRem}

            defaultValue={SITE_PADDING_DEFAULTS.contentIndentRem}

            min={0}

            max={20}

            step={0.25}

            displayValue={

              guidesLive

                ? `${frame.contentIndentRem}rem · ${indentPx}px`

                : `${draftIndentRem}rem preview · ${indentPx}rem applied`

            }

            onChange={(v) => {

              if (guidesLive) onChange({ contentIndentRem: v });

              else onDraftIndentChange(v);

            }}

          />

          <p className="font-mono text-[9px] text-muted-foreground">

            Boundary inset: {(px * 2).toLocaleString()}px · applied inner +{(indentPx * 2).toLocaleString()}px

            {!guidesLive && Math.abs(draftIndentRem - frame.contentIndentRem) > 0.01

              ? ` · preview ${(previewPx * 2).toLocaleString()}px`

              : ""}

          </p>

        </StudioAccordionSection>



        <StudioAccordionSection value="data" title="Import & export">

          <div className="flex gap-2">

            <button

              type="button"

              onClick={() => {

                const json = JSON.stringify(

                  { ...frame, previewContentIndentRem: draftIndentRem, guidesLive },

                  null,

                  2,

                );

                void navigator.clipboard.writeText(json).then(() => alert("Site padding JSON copied!"));

              }}

              className="flex-1 rounded-md border border-border py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"

            >

              Copy JSON

            </button>

            <button

              type="button"

              onClick={() => {

                onChange({ ...SITE_PADDING_DEFAULTS });

                saveSitePaddingFrame(SITE_PADDING_DEFAULTS);

              }}

              className="rounded-md border border-border px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"

            >

              Reset

            </button>

          </div>

        </StudioAccordionSection>

      </StudioAccordionPanels>

    </FloatingStudioShell>

  );

}


