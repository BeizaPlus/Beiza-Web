import { WelcomeLocaleToggle } from "@/components/welcome/WelcomeLocaleToggle";
import { WelcomeThemeToggle, type WelcomeTheme } from "@/components/welcome/WelcomeThemeToggle";
import { cn } from "@/lib/utils";

type WelcomeGateToolbarProps = {
  theme: WelcomeTheme;
  onThemeChange: (theme: WelcomeTheme) => void;
  isLight?: boolean;
  regionToggleHint: string;
  regionToggleSubhint: string;
  className?: string;
};

/** Region icons, localized hint (follows toggle), pin, and theme */
export function WelcomeGateToolbar({
  theme,
  onThemeChange,
  isLight = false,
  regionToggleHint,
  regionToggleSubhint,
  className,
}: WelcomeGateToolbarProps) {
  const muted = isLight ? "text-black/50" : "text-white/45";
  const subMuted = isLight ? "text-black/40" : "text-white/35";

  return (
    <div className={cn("flex max-w-[min(100vw-2.5rem,36rem)] flex-col items-end gap-1.5", className)}>
      <div className="flex flex-nowrap items-start justify-end gap-2">
        <WelcomeLocaleToggle isLight={isLight} />
        <WelcomeThemeToggle theme={theme} onThemeChange={onThemeChange} />
      </div>
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
