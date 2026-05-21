import { FlagIcon } from "@/components/ui/FlagIcon";
import type { WelcomeLanguageCode } from "@/lib/locale/welcomeLanguageOptions";
import { cn } from "@/lib/utils";

type WelcomeLocaleFlagProps = {
  code: WelcomeLanguageCode;
  className?: string;
};

/** ISO-style marks for the welcome language pill bar (GH, EN, ES, FR, CN) */
export function WelcomeLocaleFlag({ code, className }: WelcomeLocaleFlagProps) {
  const flag = <FlagIcon country={code} size={14} className={className} />;
  if (flag) return flag;
  return (
    <span className={cn("text-[10px] font-bold uppercase tracking-wide", className)} aria-hidden>
      {code}
    </span>
  );
}
