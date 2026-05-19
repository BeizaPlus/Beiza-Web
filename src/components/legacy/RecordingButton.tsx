import { useRef } from "react";
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
  const holdingRef = useRef(false);

  const endPress = () => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    onPressEnd();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={active ? "Recording memory — release to finish" : "Hold to record a memory"}
      className={cn(
        "relative mx-auto flex h-28 w-28 touch-none select-none items-center justify-center rounded-full border-4 transition-all",
        "border-primary bg-primary/10 text-primary shadow-focus-ring",
        active && "scale-105 border-accent bg-primary text-primary-foreground animate-pulse",
        disabled && "cursor-not-allowed opacity-50",
      )}
      onPointerDown={(e) => {
        if (disabled || holdingRef.current) return;
        e.preventDefault();
        holdingRef.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        onPressStart();
      }}
      onPointerUp={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
        endPress();
      }}
      onPointerCancel={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
        endPress();
      }}
      onLostPointerCapture={endPress}
    >
      <Mic className="h-10 w-10 pointer-events-none" strokeWidth={1.5} />
    </button>
  );
}
