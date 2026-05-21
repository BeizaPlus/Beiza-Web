import { cn } from "@/lib/utils";

type WelcomeGateToolbarProps = {
  isLight?: boolean;
  regionToggleHint: string;
  regionToggleSubhint: string;
  className?: string;
};

/** Top-right region hint copy (language rail is fixed on the right) */
export function WelcomeGateToolbar({
  isLight = false,
  regionToggleHint,
  regionToggleSubhint,
  className,
}: WelcomeGateToolbarProps) {
  const muted = isLight ? "text-black/50" : "text-white/45";
  const subMuted = isLight ? "text-black/40" : "text-white/35";

  return (
    <div className={cn("flex max-w-[min(100vw-2.5rem,36rem)] flex-col items-end gap-1.5", className)}>
      <p
        id="welcome-region-hint"
        className={cn("text-right text-[10px] font-normal leading-snug sm:text-[11px]", muted)}
      >
        {regionToggleHint}
      </p>
      <p className={cn("text-right text-[9px] font-normal leading-snug sm:text-[10px]", subMuted)}>
        {regionToggleSubhint}
      </p>
    </div>
  );
}
