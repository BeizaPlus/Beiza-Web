import { useState } from "react";

import { FloatingStudioShell } from "@/components/dev/FloatingStudioShell";

import {
  StudioAccordionPanels,
  StudioAccordionSection,
} from "@/components/dev/StudioAccordionSection";

import { StudioCopyOffsetSliders } from "@/components/dev/StudioCopyOffsetSliders";

import { StudioTextEditButton } from "@/components/dev/StudioTextEditButton";

import { StudioSlider } from "@/components/dev/StudioSlider";

import {

  pageLayoutDefaultsFor,

  pageLayoutStudioLabel,

  savePageLayoutFrame,

  type PageLayoutFrame,

} from "@/lib/pageLayoutStudio";



type Props = {

  pageId: string;

  frame: PageLayoutFrame;

  onChange: (frame: PageLayoutFrame) => void;

};



export function PageLayoutStudioPanel({ pageId, frame, onChange }: Props) {

  const [open, setOpen] = useState(true);

  const defaults = pageLayoutDefaultsFor(pageId);



  const patch = (partial: Partial<PageLayoutFrame>) => {

    const next = { ...frame, ...partial };

    onChange(next);

    savePageLayoutFrame(pageId, next);

  };



  const exportJson = () => {

    const json = JSON.stringify({ pageId, ...frame }, null, 2);

    void navigator.clipboard.writeText(json).then(() => alert("JSON copied to clipboard!"));

  };



  const reset = () => {

    onChange({ ...defaults });

    savePageLayoutFrame(pageId, { ...defaults });

  };



  return (

    <FloatingStudioShell

      panelId={`page-layout-${pageId}`}

      open={open}

      onOpen={() => setOpen(true)}

      onClose={() => setOpen(false)}

      openButtonLabel={pageLayoutStudioLabel(pageId)}

    >

      <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">

        {pageLayoutStudioLabel(pageId)}

      </p>



      <StudioTextEditButton />



      <StudioAccordionPanels defaultValue={["layout"]}>
        <StudioAccordionSection value="layout" title="Page layout">
          <StudioCopyOffsetSliders frame={frame} defaults={defaults} onPatch={patch} />

          <StudioSlider

            compact

            label="Column width (rem)"

            value={frame.maxWidthRem}

            defaultValue={defaults.maxWidthRem}

            min={20}

            max={48}

            step={0.5}

            onChange={(v) => patch({ maxWidthRem: v })}

          />
        </StudioAccordionSection>

        <StudioAccordionSection value="data" title="Import & export">
          <div className="flex gap-2">

            <button

              type="button"

              onClick={exportJson}

              className="flex-1 rounded-md border border-border py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"

            >

              Copy JSON

            </button>

            <button

              type="button"

              onClick={reset}

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

