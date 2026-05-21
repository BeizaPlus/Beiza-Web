import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type StudioSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Value restored on double-click */
  defaultValue: number;
  onChange: (value: number) => void;
  displayValue?: string;
  /** Use compact label style (welcome / page layout panels) */
  compact?: boolean;
};

function clampValue(n: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, n));
  if (step >= 1) return Math.round(clamped);
  const decimals = String(step).includes(".") ? String(step).split(".")[1]?.length ?? 2 : 2;
  return Number(clamped.toFixed(decimals));
}

function StudioValueInput({
  value,
  min,
  max,
  step,
  onChange,
  compact,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  compact?: boolean;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(step < 1 ? String(value) : String(Math.round(value)));
  }, [value, step]);

  const commit = () => {
    const parsed = Number(draft);
    if (Number.isNaN(parsed)) {
      setDraft(step < 1 ? String(value) : String(Math.round(value)));
      return;
    }
    onChange(clampValue(parsed, min, max, step));
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
          (e.target as HTMLInputElement).blur();
        }
      }}
      aria-label={`${min} to ${max}`}
      className={cn(
        "w-14 rounded border border-border bg-background px-1.5 py-0.5 text-right tabular-nums text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
        compact ? "text-[10px]" : "text-[11px]",
      )}
    />
  );
}

export function StudioSlider({
  label,
  value,
  min,
  max,
  step = 1,
  defaultValue,
  onChange,
  displayValue,
  compact = false,
}: StudioSliderProps) {
  const reset = () => onChange(defaultValue);

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
          <span className="min-w-0 flex-1">{label}</span>
          {displayValue ? (
            <span className="tabular-nums">{displayValue}</span>
          ) : (
            <StudioValueInput value={value} min={min} max={max} step={step} onChange={onChange} compact />
          )}
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onDoubleClick={reset}
          title="Double-click slider to reset"
          className="w-full cursor-pointer accent-primary"
        />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <Label className="min-w-0 flex-1">{label}</Label>
        {displayValue ? (
          <span className="tabular-nums text-muted-foreground">{displayValue}</span>
        ) : (
          <StudioValueInput value={value} min={min} max={max} step={step} onChange={onChange} />
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onDoubleClick={reset}
        title="Double-click slider to reset"
        className="w-full cursor-pointer accent-primary"
      />
    </div>
  );
}
