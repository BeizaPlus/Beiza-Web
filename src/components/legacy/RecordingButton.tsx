import { cn } from "@/lib/utils";
import { Mic } from "lucide-react";

type RecordingButtonProps = {
  active: boolean;
  disabled?: boolean;
  onPressStart: () => void;
  onPressEnd: () => void;
};

export function RecordingButton({
  active,
  disabled,
  onPressStart,
  onPressEnd,
}: RecordingButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={active ? "Recording memory" : "Hold to record a memory"}
      className={cn(
        "relative mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 transition-all",
        "border-primary bg-primary/10 text-primary shadow-focus-ring",
        active && "scale-105 border-accent bg-primary text-primary-foreground animate-pulse",
        disabled && "cursor-not-allowed opacity-50",
      )}
      onPointerDown={(e) => {
        e.preventDefault();
        onPressStart();
      }}
      onPointerUp={onPressEnd}
      onPointerLeave={active ? onPressEnd : undefined}
      onPointerCancel={onPressEnd}
    >
      <Mic className="h-10 w-10" strokeWidth={1.5} />
    </button>
  );
}
