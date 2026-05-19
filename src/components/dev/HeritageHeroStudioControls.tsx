import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { HeritageHeroFrame } from "./heroLayoutStudioState";

const HERITAGE_ZOOM_MIN = 80;
const HERITAGE_ZOOM_MAX = 150;
const ZOOM_STEP = 2;

type Props = {
  frame: HeritageHeroFrame;
  onPatch: (partial: Partial<HeritageHeroFrame>) => void;
};

export function HeritageHeroStudioControls({ frame, onPatch }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        Move text left/right to reveal the subject. Pan X/Y to frame the Gye Nyame symbol.
      </p>
      <SliderRow label="Background X" value={frame.posX} min={0} max={100} onChange={(posX) => onPatch({ posX })} />
      <SliderRow label="Background Y" value={frame.posY} min={0} max={100} onChange={(posY) => onPatch({ posY })} />
      <ZoomControls value={frame.scale} onChange={(scale) => onPatch({ scale })} />
      <div className="space-y-1">
        <Label className="text-[11px]">Text side</Label>
        <div className="flex gap-1">
          {(["left", "right"] as const).map((side) => (
            <Button
              key={side}
              type="button"
              size="sm"
              variant={frame.textSide === side ? "default" : "outline"}
              className="h-7 flex-1 text-[10px] capitalize"
              onClick={() => onPatch({ textSide: side })}
            >
              {side}
            </Button>
          ))}
        </div>
      </div>
      <SliderRow
        label="Overlay strength"
        value={frame.overlayStrength}
        min={0}
        max={100}
        displayValue={`${Math.round(frame.overlayStrength)}%`}
        onChange={(overlayStrength) => onPatch({ overlayStrength })}
      />
      <SliderRow
        label="Copy raise (% viewport height)"
        value={frame.copyRaiseVh}
        min={0}
        max={40}
        onChange={(copyRaiseVh) => onPatch({ copyRaiseVh })}
      />
    </div>
  );
}

function ZoomControls({ value, onChange }: { value: number; onChange: (scale: number) => void }) {
  const clamp = (n: number) =>
    Math.min(HERITAGE_ZOOM_MAX, Math.max(HERITAGE_ZOOM_MIN, Math.round(n)));

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
        className="w-full accent-primary"
        value={value}
        min={HERITAGE_ZOOM_MIN}
        max={HERITAGE_ZOOM_MAX}
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
  displayValue,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  displayValue?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <Label>{label}</Label>
        <span className="tabular-nums text-muted-foreground">
          {displayValue ?? Math.round(value)}
        </span>
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


