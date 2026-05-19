import { cn } from "@/lib/utils";
import { Mic, Square } from "lucide-react";

type RecordingButtonProps = {
  isRecording: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function RecordingButton({ isRecording, disabled, onPress }: RecordingButtonProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={onPress}
        aria-label={isRecording ? "Stop recording" : "Tap to record a memory"}
        aria-pressed={isRecording}
        className={cn(
          "relative flex h-28 w-28 items-center justify-center rounded-full border-4 transition-all",
          disabled && "cursor-not-allowed opacity-50",
          isRecording
            ? "border-red-500/60 bg-[#1a0000] text-red-400 ring-4 ring-red-500/40 animate-pulse"
            : "border-primary/40 bg-primary text-primary-foreground shadow-focus-ring",
        )}
      >
        {isRecording ? (
          <Square className="h-9 w-9 fill-current pointer-events-none" strokeWidth={0} />
        ) : (
          <Mic className="h-10 w-10 pointer-events-none" strokeWidth={1.5} />
        )}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        {disabled && !isRecording
          ? "Starting microphone…"
          : isRecording
            ? "Recording — tap to stop"
            : "Tap to record"}
      </p>
    </div>
  );
}