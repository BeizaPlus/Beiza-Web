import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_STUDIO_STATE,
  downloadStudioJson,
  loadStudioState,
  saveStudioState,
  studioStateToJson,
  type LandingLayoutStudioState,
  type StudioFocus,
} from "./landingLayoutStudioState";
import {
  loadHeroStudioFrame,
  saveHeroStudioFrame,
  type HeritageHeroFrame,
} from "./heroLayoutStudioState";
import { HeritageHeroStudioControls } from "./HeritageHeroStudioControls";
import { FloatingStudioShell } from "./FloatingStudioShell";

const FOCUS_LABELS: { id: StudioFocus; label: string }[] = [
  { id: "hero", label: "1. Hero" },
  { id: "heritageHero", label: "Heritage Hero" },
  { id: "offerings", label: "2. What we do" },
  { id: "faq", label: "3. FAQ" },
  { id: "pricing", label: "4. Billing" },
  { id: "outro", label: "5. Outro" },
];

type Props = {
  state: LandingLayoutStudioState;
  onChange: (next: LandingLayoutStudioState) => void;
};

export function LandingLayoutStudioPanel({ state, onChange }: Props) {
  const [open, setOpen] = useState(true);
  const [heritageFrame, setHeritageFrame] = useState<HeritageHeroFrame>(() =>
    loadHeroStudioFrame("heritage"),
  );

  const patch = (partial: Partial<LandingLayoutStudioState>) => {
    const next = { ...state, ...partial };
    onChange(next);
    saveStudioState(next);
  };

  const patchHero = (hero: Partial<LandingLayoutStudioState["hero"]>) =>
    patch({ hero: { ...state.hero, ...hero } });

  const patchOfferings = (offerings: Partial<LandingLayoutStudioState["offerings"]>) =>
    patch({ offerings: { ...state.offerings, ...offerings } });

  const patchFaq = (faq: Partial<LandingLayoutStudioState["faq"]>) =>
    patch({ faq: { ...state.faq, ...faq } });

  const patchPricing = (pricing: Partial<LandingLayoutStudioState["pricing"]>) =>
    patch({ pricing: { ...state.pricing, ...pricing } });

  const patchOutro = (outro: Partial<LandingLayoutStudioState["outro"]>) =>
    patch({ outro: { ...state.outro, ...outro } });

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const exportJson = async () => {
    const text = studioStateToJson(state);
    try {
      await navigator.clipboard.writeText(text);
      setSaveStatus("Copied");
    } catch {
      setSaveStatus("Copy failed");
    }
    window.setTimeout(() => setSaveStatus(null), 2000);
  };

  const saveJsonFile = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadStudioJson(state, `landing-layout-${stamp}.json`);
    setSaveStatus("Saved file");
    window.setTimeout(() => setSaveStatus(null), 2000);
  };

  return (
    <FloatingStudioShell
      panelId="landing"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    >
      <div className="mb-4 flex flex-wrap gap-1">
        {FOCUS_LABELS.map(({ id, label }) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={state.focus === id ? "default" : "outline"}
            className="h-7 px-2 text-[10px]"
            onClick={() => patch({ focus: id })}
          >
            {label}
          </Button>
        ))}
      </div>

      {state.focus === "heritageHero" ? (
        <HeritageHeroStudioControls
          frame={heritageFrame}
          onPatch={(partial) => {
            const next = { ...heritageFrame, ...partial };
            setHeritageFrame(next);
            saveHeroStudioFrame("heritage", next);
          }}
        />
      ) : null}

      {state.focus === "hero" ? (
        <div className="space-y-3">
          <p className="text-[11px] text-muted-foreground">
            Pan the portrait (X/Y). Zoom out to see more of the frame; zoom in to tighten on the
            subject.
          </p>
          <SliderRow
            label="Background X"
            value={state.hero.posX}
            min={0}
            max={100}
            onChange={(posX) => patchHero({ posX })}
          />
          <SliderRow
            label="Background Y"
            value={state.hero.posY}
            min={0}
            max={100}
            onChange={(posY) => patchHero({ posY })}
          />
          <ZoomControls
            value={state.hero.scale}
            onChange={(scale) => patchHero({ scale })}
          />
          <SliderRow
            label="Copy raise (% viewport height)"
            value={state.hero.copyBottomVh}
            min={8}
            max={52}
            onChange={(copyBottomVh) => patchHero({ copyBottomVh })}
          />
        </div>
      ) : null}

      {state.focus === "offerings" ? (
        <div className="space-y-3">
          <SliderRow
            label="Section move up"
            value={-state.offerings.offsetY}
            min={-120}
            max={120}
            onChange={(v) => patchOfferings({ offsetY: -v })}
          />
          <SliderRow
            label="Top padding"
            value={state.offerings.paddingTop}
            min={0}
            max={200}
            onChange={(paddingTop) => patchOfferings({ paddingTop })}
          />
        </div>
      ) : null}

      {state.focus === "faq" ? (
        <div className="space-y-3">
          <SliderRow
            label="Section move up"
            value={-state.faq.offsetY}
            min={-120}
            max={120}
            onChange={(v) => patchFaq({ offsetY: -v })}
          />
          <SliderRow
            label="Top padding"
            value={state.faq.paddingTop}
            min={0}
            max={200}
            onChange={(paddingTop) => patchFaq({ paddingTop })}
          />
        </div>
      ) : null}

      {state.focus === "pricing" ? (
        <div className="space-y-3">
          <SliderRow
            label="Section move up"
            value={-state.pricing.offsetY}
            min={-120}
            max={120}
            onChange={(v) => patchPricing({ offsetY: -v })}
          />
          <SliderRow
            label="Top padding"
            value={state.pricing.paddingTop}
            min={0}
            max={200}
            onChange={(paddingTop) => patchPricing({ paddingTop })}
          />
        </div>
      ) : null}

      {state.focus === "outro" ? (
        <div className="space-y-3">
          <SliderRow
            label="Section move up"
            value={-state.outro.offsetY}
            min={-120}
            max={120}
            onChange={(v) => patchOutro({ offsetY: -v })}
          />
          <SliderRow
            label="Top padding"
            value={state.outro.paddingTop}
            min={0}
            max={200}
            onChange={(paddingTop) => patchOutro({ paddingTop })}
          />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" className="h-7 text-[10px]" onClick={() => void exportJson()}>
          Copy JSON
        </Button>
        <Button type="button" size="sm" variant="secondary" className="h-7 text-[10px]" onClick={saveJsonFile}>
          Save JSON
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-[10px]"
          onClick={() => {
            onChange(DEFAULT_STUDIO_STATE);
            saveStudioState(DEFAULT_STUDIO_STATE);
          }}
        >
          Reset
        </Button>
      </div>
      {saveStatus ? <p className="mt-2 text-[10px] text-primary">{saveStatus}</p> : null}
    </FloatingStudioShell>
  );
}

const HERO_ZOOM_MIN = 70;
const HERO_ZOOM_MAX = 160;
const HERO_ZOOM_STEP = 2;

function ZoomControls({
  value,
  onChange,
}: {
  value: number;
  onChange: (scale: number) => void;
}) {
  const clamp = (n: number) =>
    Math.min(HERO_ZOOM_MAX, Math.max(HERO_ZOOM_MIN, Math.round(n)));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <Label>Zoom</Label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 w-7 px-0 text-base"
            aria-label="Zoom out"
            onClick={() => onChange(clamp(value - HERO_ZOOM_STEP))}
          >
            −
          </Button>
          <span className="min-w-[2.5rem] text-center tabular-nums text-muted-foreground">
            {Math.round(value)}%
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 w-7 px-0 text-base"
            aria-label="Zoom in"
            onClick={() => onChange(clamp(value + HERO_ZOOM_STEP))}
          >
            +
          </Button>
        </div>
      </div>
      <input
        type="range"
        className="w-full accent-primary"
        value={value}
        min={HERO_ZOOM_MIN}
        max={HERO_ZOOM_MAX}
        step={1}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
      />
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <Label>{label}</Label>
        <span className="tabular-nums text-muted-foreground">{Math.round(value)}</span>
      </div>
      <input
        type="range"
        className="w-full accent-primary"
        value={value}
        min={min}
        max={max}
        step={1}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/** Loads saved hero framing always; panel visibility follows `panelEnabled`. */
export function useLandingLayoutStudio(panelEnabled: boolean) {
  const [state, setState] = useState<LandingLayoutStudioState>(() => loadStudioState());

  useEffect(() => {
    setState(loadStudioState());
  }, []);

  return { panelEnabled, state, setState };
}
