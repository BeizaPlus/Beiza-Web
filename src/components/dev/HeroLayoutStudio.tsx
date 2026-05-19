import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  downloadHeroStudioJson,
  HERO_STUDIO_DEFAULTS,
  heroStudioToJson,
  loadHeroStudioFrame,
  saveHeroStudioFrame,
  type HeroFrame,
  type HeroStudioPage,
} from "./heroLayoutStudioState";

const HERO_ZOOM_MIN = 70;
const HERO_ZOOM_MAX = 160;
const HERO_ZOOM_STEP = 2;

const PAGE_LABELS: Record<HeroStudioPage, string> = {
  events: "Events hero (also landing featured)",
  heritage: "Heritage hero",
};

type PanelProps = {
  page: HeroStudioPage;
  frame: HeroFrame;
  onChange: (frame: HeroFrame) => void;
};

export function HeroLayoutStudioPanel({ page, frame, onChange }: PanelProps) {
  const [open, setOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const patch = (partial: Partial<HeroFrame>) => {
    const next = { ...frame, ...partial };
    onChange(next);
    saveHeroStudioFrame(page, next);
  };

  const exportJson = async () => {
    const text = heroStudioToJson(page, frame);
    try {
      await navigator.clipboard.writeText(text);
      setSaveStatus("Copied");
    } catch {
      setSaveStatus("Copy failed");
    }
    window.setTimeout(() => setSaveStatus(null), 2000);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[200] rounded-full bg-[#E6A817] px-4 py-2 text-xs font-semibold text-[#0a0a0a] shadow-lg"
      >
        Layout studio · zoom
      </button>
    );
  }

  return (
    <aside className="fixed bottom-4 right-4 z-[200] w-[min(100vw-2rem,22rem)] rounded-xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {PAGE_LABELS[page]}
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Hide
        </button>
      </div>

      <p className="mb-3 text-[11px] text-muted-foreground">
        Pan the portrait (X/Y). Zoom 70–160% to frame the subject.
      </p>

      <div className="space-y-3">
        <SliderRow label="Background X" value={frame.posX} min={0} max={100} onChange={(posX) => patch({ posX })} />
        <SliderRow label="Background Y" value={frame.posY} min={0} max={100} onChange={(posY) => patch({ posY })} />
        <ZoomControls value={frame.scale} onChange={(scale) => patch({ scale })} />
        <SliderRow
          label="Copy raise (% viewport height)"
          value={frame.copyBottomVh}
          min={8}
          max={52}
          onChange={(copyBottomVh) => patch({ copyBottomVh })}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={() => exportJson()}>
          Copy JSON
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          onClick={() => downloadHeroStudioJson(page, frame)}
        >
          Save file
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 text-xs"
          onClick={() => patch({ ...HERO_STUDIO_DEFAULTS[page] })}
        >
          Reset
        </Button>
      </div>
      {saveStatus ? <p className="mt-2 text-[10px] text-primary">{saveStatus}</p> : null}
    </aside>
  );
}

export function useHeroLayoutStudio(page: HeroStudioPage) {
  const [frame, setFrame] = useState<HeroFrame>(() => loadHeroStudioFrame(page));

  useEffect(() => {
    setFrame(loadHeroStudioFrame(page));
  }, [page]);

  return { frame, setFrame };
}

function ZoomControls({ value, onChange }: { value: number; onChange: (scale: number) => void }) {
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
