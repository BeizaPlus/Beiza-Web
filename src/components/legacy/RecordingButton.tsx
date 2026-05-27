import { cn } from "@/lib/utils";
import { Mic, Square } from "lucide-react";

type RecordingButtonProps = {
  isRecording: boolean;
  disabled?: boolean;
  onPress: () => void;
  /** Tighter control for viewport-fitted record station */
  compact?: boolean;
  /** Hide caption under mic (hero provides copy) */
  hideCaption?: boolean;
};

export function RecordingButton({
  isRecording,
  disabled,
  onPress,
  compact = false,
  hideCaption = false,
}: RecordingButtonProps) {
  return (
    <div className={cn("flex flex-col items-center", compact ? "gap-1.5" : "gap-3")}>
      <button
        type="button"
        disabled={disabled}
        onClick={onPress}
        aria-label={isRecording ? "Stop recording" : "Tap to record a memory"}
        aria-pressed={isRecording}
        className={cn(
          "relative flex items-center justify-center rounded-full border-4 transition-all",
          compact ? "h-20 w-20 border-[3px]" : "h-28 w-28",
          disabled && "cursor-not-allowed opacity-50",
          isRecording
            ? "border-red-500/60 bg-[#1a0000] text-red-400 ring-4 ring-red-500/40 animate-pulse"
            : "border-[#E6A817]/40 bg-[#E6A817] text-[#0a0a0a] shadow-focus-ring",
        )}
      >
        {isRecording ? (
          <Square
            className={cn("fill-current pointer-events-none", compact ? "h-7 w-7" : "h-9 w-9")}
            strokeWidth={0}
          />
        ) : (
          <Mic
            className={cn("pointer-events-none", compact ? "h-8 w-8" : "h-10 w-10")}
            strokeWidth={1.5}
          />
        )}
      </button>
      {!hideCaption ? (
        <p className={cn("text-center text-muted-foreground", compact ? "text-[11px]" : "text-sm")}>
          {disabled && !isRecording
            ? "Starting microphone…"
            : isRecording
              ? "Recording — tap to stop"
              : "Tap to record"}
        </p>
      ) : null}
    </div>
  );
}