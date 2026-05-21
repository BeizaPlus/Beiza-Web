import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  downloadHeroStudioJson,
  HERITAGE_HERO_DEFAULTS,
  HERO_STUDIO_DEFAULTS,
  heroStudioToJson,
  loadHeroStudioFrame,
  saveHeroStudioFrame,
  type HeritageHeroFrame,
  type HeroFrame,
  type HeroStudioPage,
} from "./heroLayoutStudioState";
import { HeritageHeroStudioControls } from "./HeritageHeroStudioControls";
import { FloatingStudioShell } from "./FloatingStudioShell";
import { StudioSlider } from "./StudioSlider";

const EVENTS_ZOOM_MIN = 70;
const EVENTS_ZOOM_MAX = 160;
const ZOOM_STEP = 2;

type EventsPanelProps = {
  page: "events";
  frame: HeroFrame;
  onChange: (frame: HeroFrame) => void;
};

type HeritagePanelProps = {
  page: "heritage";
  frame: HeritageHeroFrame;
  onChange: (frame: HeritageHeroFrame) => void;
};

type PanelProps = EventsPanelProps | HeritagePanelProps;

export function HeroLayoutStudioPanel(props: PanelProps) {
  const { page, frame, onChange } = props;
  const [open, setOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"heritage" | "events">(
    page === "heritage" ? "heritage" : "events",
  );

  const patchEvents = (partial: Partial<HeroFrame>) => {
    if (page !== "events") return;
    const next = { ...frame, ...partial };
    onChange(next);
    saveHeroStudioFrame("events", next);
  };

  const patchHeritage = (partial: Partial<HeritageHeroFrame>) => {
    if (page !== "heritage") return;
    const next = { ...frame, ...partial };
    onChange(next);
    saveHeroStudioFrame("heritage", next);
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

  return (
    <FloatingStudioShell
      panelId={`hero-${page}`}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    >
      <div className="mb-3 flex flex-wrap gap-1">
        {page === "heritage" ? (
          <Button
            type="button"
            size="sm"
            variant={activeTab === "heritage" ? "default" : "outline"}
            className="h-7 px-2 text-[10px]"
            onClick={() => setActiveTab("heritage")}
          >
            Heritage Hero
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant={activeTab === "events" ? "default" : "outline"}
            className="h-7 px-2 text-[10px]"
            onClick={() => setActiveTab("events")}
          >
            Events hero
          </Button>
        )}
      </div>

      {page === "heritage" && activeTab === "heritage" ? (
        <HeritageHeroStudioControls frame={frame} onPatch={patchHeritage} />
      ) : page === "events" ? (
        <EventsControls frame={frame} onPatch={patchEvents} />
      ) : null}

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
          onClick={() =>
            page === "heritage"
              ? patchHeritage({ ...HERITAGE_HERO_DEFAULTS })
              : patchEvents({ ...HERO_STUDIO_DEFAULTS.events })
          }
        >
          Reset
        </Button>
      </div>
      {saveStatus ? <p className="mt-2 text-[10px] text-primary">{saveStatus}</p> : null}
    </FloatingStudioShell>
  );
}

function EventsControls({
  frame,
  onPatch,
}: {
  frame: HeroFrame;
  onPatch: (partial: Partial<HeroFrame>) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        Pan the portrait (X/Y). Zoom 70–160% to frame the subject.
      </p>
      <StudioSlider
        label="Background X"
        value={frame.posX}
        defaultValue={HERO_STUDIO_DEFAULTS.events.posX}
        min={0}
        max={100}
        onChange={(posX) => onPatch({ posX })}
      />
      <StudioSlider
        label="Background Y"
        value={frame.posY}
        defaultValue={HERO_STUDIO_DEFAULTS.events.posY}
        min={0}
        max={100}
        onChange={(posY) => onPatch({ posY })}
      />
      <ZoomControls
        value={frame.scale}
        defaultValue={HERO_STUDIO_DEFAULTS.events.scale}
        min={EVENTS_ZOOM_MIN}
        max={EVENTS_ZOOM_MAX}
        onChange={(scale) => onPatch({ scale })}
      />
      <StudioSlider
        label="Copy raise (% viewport height)"
        value={frame.copyBottomVh}
        defaultValue={HERO_STUDIO_DEFAULTS.events.copyBottomVh}
        min={8}
        max={52}
        onChange={(copyBottomVh) => onPatch({ copyBottomVh })}
      />
    </div>
  );
}

export function useHeroLayoutStudio(page: "events"): {
  frame: HeroFrame;
  setFrame: (frame: HeroFrame) => void;
};
export function useHeroLayoutStudio(page: "heritage"): {
  frame: HeritageHeroFrame;
  setFrame: (frame: HeritageHeroFrame) => void;
};
export function useHeroLayoutStudio(page: HeroStudioPage) {
  const [frame, setFrame] = useState(() => loadHeroStudioFrame(page));

  useEffect(() => {
    setFrame(loadHeroStudioFrame(page));
  }, [page]);

  return { frame, setFrame };
}

function ZoomControls({
  value,
  defaultValue,
  min,
  max,
  onChange,
}: {
  value: number;
  defaultValue: number;
  min: number;
  max: number;
  onChange: (scale: number) => void;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)));

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
            onClick={() => onChange(clamp(value - ZOOM_STEP))}
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
            onClick={() => onChange(clamp(value + ZOOM_STEP))}
          >
            +
          </Button>
        </div>
      </div>
      <input
        type="range"
        className="w-full cursor-pointer accent-primary"
        value={value}
        min={min}
        max={max}
        step={1}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        onDoubleClick={() => onChange(clamp(defaultValue))}
        title="Double-click to reset"
      />
    </div>
  );
}
