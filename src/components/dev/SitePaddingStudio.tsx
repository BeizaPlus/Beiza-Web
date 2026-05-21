import { useEffect, useState, type ReactNode } from "react";
import { SiteIndentGuides } from "@/components/dev/SiteIndentGuides";
import { FloatingStudioShell } from "@/components/dev/FloatingStudioShell";
import { StudioSlider } from "@/components/dev/StudioSlider";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import {
  SITE_PADDING_DEFAULTS,
  applySitePaddingCssVar,
  loadSitePaddingFrame,
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
  const studioOn = isLayoutStudioEnabled();

  useEffect(() => {
    applySitePaddingCssVar(frame);
  }, [frame]);

  useEffect(() => {
    const html = document.documentElement;
    if (studioOn) html.classList.add("site-padding-guides");
    else html.classList.remove("site-padding-guides");
    return () => html.classList.remove("site-padding-guides");
  }, [studioOn]);

  return (
    <>
      {children}
      {studioOn ? (
        <>
          <SiteIndentGuides frame={frame} onChange={setFrame} visible />
          <SitePaddingStudioPanel frame={frame} onChange={setFrame} />
        </>
      ) : null}
    </>
  );
}

function SitePaddingStudioPanel({
  frame,
  onChange,
}: {
  frame: SitePaddingFrame;
  onChange: (frame: SitePaddingFrame) => void;
}) {
  const [open, setOpen] = useState(true);
  const px = sitePaddingPx(frame);
  const indentPx = siteContentIndentPx(frame);

  const patch = (partial: Partial<SitePaddingFrame>) => {
    const next = { ...frame, ...partial };
    onChange(next);
    saveSitePaddingFrame(next);
  };

  return (
    <FloatingStudioShell
      panelId="site-padding"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      openButtonLabel="Site padding"
      openButtonClassName="right-4 bottom-28 left-auto"
    >
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Site bounds (global)
      </p>
      <p className="mb-3 text-[9px] leading-snug text-muted-foreground">
        Yellow lines = site boundary. Cyan handles = inner indent (drag to set copy alignment site-wide).
        Reference: Heritage (/farewell).
      </p>

      <StudioSlider
        compact
        label="Boundary each side (rem)"
        value={frame.paddingXRem}
        defaultValue={SITE_PADDING_DEFAULTS.paddingXRem}
        min={0}
        max={8}
        step={0.25}
        displayValue={`${frame.paddingXRem}rem · ${px}px`}
        onChange={(v) => patch({ paddingXRem: v })}
      />

      <StudioSlider
        compact
        label="Indent inside boundary (rem)"
        value={frame.contentIndentRem}
        defaultValue={SITE_PADDING_DEFAULTS.contentIndentRem}
        min={0}
        max={4}
        step={0.25}
        displayValue={`${frame.contentIndentRem}rem · ${indentPx}px`}
        onChange={(v) => patch({ contentIndentRem: v })}
      />

      <p className="mt-2 font-mono text-[9px] text-muted-foreground">
        Total boundary inset: {(px * 2).toLocaleString()}px · inner +{(indentPx * 2).toLocaleString()}px
      </p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => {
            const json = JSON.stringify(frame, null, 2);
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
    </FloatingStudioShell>
  );
}
