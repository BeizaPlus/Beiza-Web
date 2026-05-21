import { StudioSlider } from "@/components/dev/StudioSlider";
import {
  COPY_OFFSET_LIMITS,
  type CopyOffsetFields,
} from "@/lib/copyLayoutOffset";

type Props = {
  frame: CopyOffsetFields;
  defaults: CopyOffsetFields;
  onPatch: (partial: Partial<CopyOffsetFields>) => void;
  showLift?: boolean;
};

/** Shared copy ← / → / ↑ / ↓ controls (vw / vh) for layout studio panels */
export function StudioCopyOffsetSliders({
  frame,
  defaults,
  onPatch,
  showLift = true,
}: Props) {
  const { offsetX, offsetY, copyLift } = COPY_OFFSET_LIMITS;

  return (
    <>
      <StudioSlider
        compact
        label="Move copy ← / → (vw)"
        value={frame.offsetX}
        defaultValue={defaults.offsetX}
        min={offsetX.min}
        max={offsetX.max}
        step={offsetX.step}
        displayValue={`${frame.offsetX}vw`}
        onChange={(v) => onPatch({ offsetX: v })}
      />
      <StudioSlider
        compact
        label="Move copy ↑ / ↓ (vh)"
        value={frame.offsetY}
        defaultValue={defaults.offsetY}
        min={offsetY.min}
        max={offsetY.max}
        step={offsetY.step}
        displayValue={`${frame.offsetY}vh`}
        onChange={(v) => onPatch({ offsetY: v })}
      />
      {showLift ? (
        <StudioSlider
          compact
          label="Lift copy ↑ (vh)"
          value={frame.copyLift ?? 0}
          defaultValue={defaults.copyLift ?? 0}
          min={copyLift.min}
          max={copyLift.max}
          step={copyLift.step}
          displayValue={`${frame.copyLift ?? 0}vh`}
          onChange={(v) => onPatch({ copyLift: v })}
        />
      ) : null}
    </>
  );
}
