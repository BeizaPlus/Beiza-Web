import { Pin, PinOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocaleContext } from "@/context/LocaleContext";
import { WelcomeLocaleFlag } from "@/components/welcome/WelcomeLocaleFlag";
import { welcomeCopyForLocale } from "@/lib/locale/welcomeCopy";
import {
  WELCOME_LANGUAGE_OPTIONS,
  welcomeToolbarCode,
} from "@/lib/locale/welcomeLanguageOptions";

type WelcomeLocaleToggleProps = {
  isLight?: boolean;
};

export function WelcomeLocaleToggle({ isLight = false }: WelcomeLocaleToggleProps) {
  const { locale, setLocale, localePinned, setLocalePinned } = useLocaleContext();
  const activeCode = welcomeToolbarCode(locale);
  const pinCopy = welcomeCopyForLocale(locale);

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-nowrap items-center gap-1.5">
        <div
          className={cn(
            "flex shrink-0 flex-nowrap items-center gap-0.5 rounded-full border px-1 py-1",
            isLight ? "border-black/15 bg-white/90 text-black" : "border-white/15 bg-[#141414]/90 text-white",
          )}
          role="group"
          aria-label="Region & language"
          aria-describedby="welcome-region-hint"
        >
          {WELCOME_LANGUAGE_OPTIONS.map(({ locale: id, code, title }) => {
            const isActive = activeCode === code;
            return (
              <button
                key={code}
                type="button"
                title={title}
                aria-label={`${code} — ${title}`}
                onClick={() => setLocale(id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold tracking-wide transition sm:px-3",
                  isActive
                    ? "bg-[#f5c518] text-black shadow-sm"
                    : isLight
                      ? "text-black/55 hover:bg-black/5 hover:text-black"
                      : "text-white/55 hover:bg-white/8 hover:text-white/90",
                )}
                aria-pressed={isActive}
              >
                <WelcomeLocaleFlag code={code} />
                <span className="whitespace-nowrap">{code}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setLocalePinned(!localePinned)}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition",
            isLight
              ? localePinned
                ? "border-black/25 bg-black/10 text-black"
                : "border-black/15 text-black/40 hover:bg-black/5 hover:text-black"
              : localePinned
                ? "border-white/35 bg-white/15 text-white"
                : "border-white/20 text-white/45 hover:bg-white/10 hover:text-white",
          )}
          aria-pressed={localePinned}
          aria-label={localePinned ? pinCopy.unpinLabel : pinCopy.pinLabel}
          title={localePinned ? pinCopy.unpinLabel : pinCopy.pinLabel}
        >
          {localePinned ? (
            <Pin className="h-3.5 w-3.5" strokeWidth={1.75} />
          ) : (
            <PinOff className="h-3.5 w-3.5" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </div>
  );
}
