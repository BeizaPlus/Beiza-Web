import { useState, type CSSProperties, type ReactNode } from "react";
import { FloatingStudioShell } from "@/components/dev/FloatingStudioShell";
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
  /** Record overlay: ignore saved translate offsets (prevents black band) */
  disableTransform?: boolean;
};

export function LegacyNavStudio({ children, className, disableTransform = false }: Props) {
  const studioEnabled = isLayoutStudioEnabled();
  const [frame, setFrame] = useState<LegacyNavStudioFrame>(() => loadLegacyNavStudioFrame());
  const [open, setOpen] = useState(true);

  const patch = (partial: Partial<LegacyNavStudioFrame>) => {
    const next = { ...frame, ...partial };
    setFrame(next);
    saveLegacyNavStudioFrame(next);
  };

  const labelLiftStyle: CSSProperties | undefined =
    frame.labelLift > 0 ? { ["--legacy-nav-label-lift" as string]: `${frame.labelLift}px` } : undefined;

  return (
    <>
      <div
        className={cn("legacy-nav-studio mx-auto w-full", className)}
        style={
          disableTransform
            ? { ...labelLiftStyle }
            : { ...legacyNavStudioStyle(frame), ...labelLiftStyle }
        }
      >
        {children}
      </div>

      {studioEnabled ? (
        <FloatingStudioShell
          panelId="legacy-tab-nav"
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          openButtonClassName="bottom-14"
          openButtonLabel="Tab bar studio"
        >
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Legacy tab bar
          </p>
          <p className="mb-3 text-[9px] leading-snug text-muted-foreground">
            Moves the Home · Tree · Record · Vault · Invite row. Negative ↑ / ↓ pulls the bar into view.
          </p>

          <StudioTextEditButton />

          <div className="space-y-3">
            <StudioSlider
              compact
              label="Move tab bar ← / → (px)"
              value={frame.offsetX}
              defaultValue={LEGACY_NAV_STUDIO_DEFAULTS.offsetX}
              min={-160}
              max={160}
              onChange={(v) => patch({ offsetX: v })}
            />
            <StudioSlider
              compact
              label="Move tab bar ↑ / ↓ (px)"
              value={frame.offsetY}
              defaultValue={LEGACY_NAV_STUDIO_DEFAULTS.offsetY}
              min={-400}
              max={400}
              onChange={(v) => patch({ offsetY: v })}
            />
            <StudioSlider
              compact
              label="Lift tab labels ↑ (px)"
              value={frame.labelLift}
              defaultValue={LEGACY_NAV_STUDIO_DEFAULTS.labelLift}
              min={0}
              max={24}
              onChange={(v) => patch({ labelLift: v })}
            />
            <StudioSlider
              compact
              label="Tab bar width (rem)"
              value={frame.maxWidthRem}
              defaultValue={LEGACY_NAV_STUDIO_DEFAULTS.maxWidthRem}
              min={20}
              max={48}
              step={0.5}
              onChange={(v) => patch({ maxWidthRem: v })}
            />
          </div>

          <button
            type="button"
            onClick={() => patch({ offsetY: 0, offsetX: 0 })}
            className="mt-3 w-full rounded-md bg-primary/15 py-2 text-[10px] font-semibold uppercase tracking-widest text-primary hover:bg-primary/25"
          >
            Reset tab bar position
          </button>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                const json = JSON.stringify(frame, null, 2);
                void navigator.clipboard.writeText(json).then(() => alert("Tab bar JSON copied!"));
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
        </FloatingStudioShell>
      ) : null}
    </>
  );
}
