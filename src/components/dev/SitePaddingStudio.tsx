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

import { useLayoutStudioBreakpoint } from "@/hooks/useLayoutStudioViewport";
import { useStudioPanel } from "@/hooks/useStudioPanel";
import {
  layoutBreakpointFromWidth,
  layoutBreakpointLabel,
  type LayoutStudioBreakpoint,
} from "@/lib/layoutBreakpoints";

import {

  SITE_PADDING_DEFAULTS,

  SITE_PADDING_PHONE_DEFAULTS,

  SITE_PADDING_TABLET_DEFAULTS,

  applySitePaddingCssVar,

  loadIndentGuidesLive,

  loadSitePaddingFrame,

  patchSitePaddingBoundary,

  patchSitePaddingIndent,

  saveIndentGuidesLive,

  saveSitePaddingFrame,

  siteContentIndentPx,

  sitePaddingBoundaryForBreakpoint,

  sitePaddingForViewport,

  sitePaddingIndentForBreakpoint,

  sitePaddingPx,

  type SitePaddingFrame,

} from "@/lib/sitePaddingStudio";



type Props = {

  children: ReactNode;

};



/** Applies site layout CSS vars globally; panel on localhost / ?studio=1 */

export function SitePaddingStudioProvider({ children }: Props) {

  const [frame, setFrame] = useState<SitePaddingFrame>(() => loadSitePaddingFrame());

  const [draftIndentRem, setDraftIndentRem] = useState(() => {
    const f = loadSitePaddingFrame();
    const bp =
      typeof window !== "undefined" ? layoutBreakpointFromWidth(window.innerWidth) : "desktop";
    return sitePaddingIndentForBreakpoint(f, bp);
  });

  const [guidesLive, setGuidesLive] = useState(() => loadIndentGuidesLive());

  const studioOn = isLayoutStudioEnabled();

  const breakpoint = useLayoutStudioBreakpoint();

  const guideFrame = sitePaddingForViewport(frame, breakpoint);

  const { guidesVisible } = useLayoutStudio();

  const showGuides = studioOn && guidesVisible;

  const showHudPanels = studioOn;



  useEffect(() => {

    applySitePaddingCssVar(frame, { studioActive: studioOn });

    return () => {

      if (studioOn) applySitePaddingCssVar(frame, { studioActive: false });

    };

  }, [frame, studioOn]);

  useEffect(() => {

    setDraftIndentRem(sitePaddingIndentForBreakpoint(frame, breakpoint));

  }, [breakpoint, frame]);



  const patch = (partial: Partial<SitePaddingFrame>) => {

    const next = { ...frame, ...partial };

    setFrame(next);

    saveSitePaddingFrame(next);

    if (partial.contentIndentRem !== undefined) {

      setDraftIndentRem(partial.contentIndentRem);

    }

    if (
      partial.contentIndentRemPhone !== undefined ||
      partial.contentIndentRemTablet !== undefined ||
      partial.contentIndentRem !== undefined
    ) {
      setDraftIndentRem(sitePaddingIndentForBreakpoint(next, breakpoint));
    }

  };



  const onGuideIndentChange = (contentIndentRem: number) => {

    if (guidesLive) {

      patch(patchSitePaddingIndent(breakpoint, contentIndentRem));

    } else {

      setDraftIndentRem(contentIndentRem);

    }

  };



  const applyDraftIndent = () => {

    patch(patchSitePaddingIndent(breakpoint, draftIndentRem));

  };



  const setGuidesLiveMode = (live: boolean) => {

    setGuidesLive(live);

    saveIndentGuidesLive(live);

    if (live) {

      patch(patchSitePaddingIndent(breakpoint, draftIndentRem));

    }

  };



  return (

    <>

      {children}

      {showGuides ? (

        <SiteIndentGuides

          frame={guideFrame}

          viewportLabel={breakpoint}

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

          breakpoint={breakpoint}

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

  breakpoint,

  draftIndentRem,

  guidesLive,

  onChange,

  onDraftIndentChange,

  onGuidesLiveChange,

}: {

  frame: SitePaddingFrame;

  breakpoint: LayoutStudioBreakpoint;

  draftIndentRem: number;

  guidesLive: boolean;

  onChange: (partial: Partial<SitePaddingFrame>) => void;

  onDraftIndentChange: (rem: number) => void;

  onGuidesLiveChange: (live: boolean) => void;

}) {

  const studioPanel = useStudioPanel("site-padding");

  const active = sitePaddingForViewport(frame, breakpoint);

  const boundaryRem = sitePaddingBoundaryForBreakpoint(frame, breakpoint);

  const appliedIndentRem = sitePaddingIndentForBreakpoint(frame, breakpoint);

  const boundaryMax = breakpoint === "phone" ? 2 : breakpoint === "tablet" ? 4 : 8;

  const indentMax = breakpoint === "phone" ? 1.5 : breakpoint === "tablet" ? 3 : 20;

  const boundaryDefault =

    breakpoint === "phone"

      ? SITE_PADDING_PHONE_DEFAULTS.paddingXRemPhone

      : breakpoint === "tablet"

        ? SITE_PADDING_TABLET_DEFAULTS.paddingXRemTablet

        : SITE_PADDING_DEFAULTS.paddingXRem;

  const indentDefault =

    breakpoint === "phone"

      ? SITE_PADDING_PHONE_DEFAULTS.contentIndentRemPhone

      : breakpoint === "tablet"

        ? SITE_PADDING_TABLET_DEFAULTS.contentIndentRemTablet

        : SITE_PADDING_DEFAULTS.contentIndentRem;

  const px = sitePaddingPx(active);

  const indentPx = siteContentIndentPx(active);

  const previewPx = siteContentIndentPx({ ...active, contentIndentRem: draftIndentRem });



  return (

    <FloatingStudioShell

      panelId="site-padding"

      open={studioPanel.open}

      onOpen={studioPanel.onOpen}

      onClose={studioPanel.onClose}

      openButtonLabel="Site bounds"

    >

      <p className="mb-2 text-[9px] leading-snug text-muted-foreground">

        Yellow = site boundary. Cyan handles = inner indent. Heritage (/farewell) is the reference.

      </p>

      <p className="mb-3 rounded-md border border-primary/30 bg-primary/10 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">

        Editing: {layoutBreakpointLabel(breakpoint)} — resize the window or use devtools device mode

      </p>



      <StudioAccordionPanels defaultValue="guides">

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



        <StudioAccordionSection value="bounds" title={`${layoutBreakpointLabel(breakpoint)} bounds`}>

          <StudioSlider

            compact

            label="Boundary each side (rem)"

            value={boundaryRem}

            defaultValue={boundaryDefault}

            min={0}

            max={boundaryMax}

            step={0.125}

            displayValue={`${boundaryRem}rem · ${px}px`}

            onChange={(v) => onChange(patchSitePaddingBoundary(breakpoint, v))}

          />

          <StudioSlider

            compact

            label="Indent inside boundary (rem)"

            value={guidesLive ? appliedIndentRem : draftIndentRem}

            defaultValue={indentDefault}

            min={0}

            max={indentMax}

            step={0.125}

            displayValue={

              guidesLive

                ? `${appliedIndentRem}rem · ${indentPx}px`

                : `${draftIndentRem}rem preview · ${appliedIndentRem}rem applied`

            }

            onChange={(v) => {

              if (guidesLive) {

                onChange(patchSitePaddingIndent(breakpoint, v));

              } else {

                onDraftIndentChange(v);

              }

            }}

          />

          <p className="font-mono text-[9px] text-muted-foreground">

            Boundary inset: {(px * 2).toLocaleString()}px · applied inner +{(indentPx * 2).toLocaleString()}px

            {!guidesLive && Math.abs(draftIndentRem - appliedIndentRem) > 0.01

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


