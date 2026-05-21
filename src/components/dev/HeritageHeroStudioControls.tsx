import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StudioSlider } from "./StudioSlider";
import { HERITAGE_HERO_DEFAULTS, type HeritageHeroFrame } from "./heroLayoutStudioState";

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
        Text align left/right; pan X/Y to frame the Gye Nyame symbol.
      </p>
      <StudioSlider
        label="Background X"
        value={frame.posX}
        defaultValue={HERITAGE_HERO_DEFAULTS.posX}
        min={0}
        max={100}
        onChange={(posX) => onPatch({ posX })}
      />
      <StudioSlider
        label="Background Y"
        value={frame.posY}
        defaultValue={HERITAGE_HERO_DEFAULTS.posY}
        min={0}
        max={100}
        onChange={(posY) => onPatch({ posY })}
      />
      <ZoomControls
        value={frame.scale}
        defaultValue={HERITAGE_HERO_DEFAULTS.scale}
        onChange={(scale) => onPatch({ scale })}
      />
      <div className="space-y-1">
        <Label className="text-[11px]">Text align</Label>
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
      <StudioSlider
        label="Overlay strength"
        value={frame.overlayStrength}
        defaultValue={HERITAGE_HERO_DEFAULTS.overlayStrength}
        min={0}
        max={100}
        displayValue={`${Math.round(frame.overlayStrength)}%`}
        onChange={(overlayStrength) => onPatch({ overlayStrength })}
      />
      <StudioSlider
        label="Copy raise (% viewport height)"
        value={frame.copyRaiseVh}
        defaultValue={HERITAGE_HERO_DEFAULTS.copyRaiseVh}
        min={0}
        max={40}
        onChange={(copyRaiseVh) => onPatch({ copyRaiseVh })}
      />
    </div>
  );
}

function ZoomControls({
  value,
  defaultValue,
  onChange,
}: {
  value: number;
  defaultValue: number;
  onChange: (scale: number) => void;
}) {
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
        className="w-full cursor-pointer accent-primary"
        value={value}
        min={HERITAGE_ZOOM_MIN}
        max={HERITAGE_ZOOM_MAX}
        step={1}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        onDoubleClick={() => onChange(clamp(defaultValue))}
        title="Double-click to reset"
      />
    </div>
  );
}


