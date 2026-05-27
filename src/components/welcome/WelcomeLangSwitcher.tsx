import { cn } from "@/lib/utils";
import { WelcomeLocaleFlag } from "@/components/welcome/WelcomeLocaleFlag";
import { useWelcomeLocaleRailBehavior } from "@/hooks/useWelcomeLocaleRailBehavior";
import {
  WELCOME_LANGUAGE_OPTIONS,
  welcomeToolbarCode,
} from "@/lib/locale/welcomeLanguageOptions";
import type { LocaleRailLayout } from "@/lib/welcomeStudio";

type Props = {
  isLight?: boolean;
  rail?: LocaleRailLayout;
  className?: string;
};

/**
 * Mobile (≤809px) — horizontal language row under the welcome subheading.
 * Replaces the bottom locale pill; desktop keeps the side rail.
 */
export function WelcomeLangSwitcher({ isLight = false, rail, className }: Props) {
  const { locale, activeIndex, activeOption, selectOption, pauseAutoHandlers } =
    useWelcomeLocaleRailBehavior(rail);

  return (
    <nav
      className={cn(
        "welcome-lang-switcher flex max-[809px]:flex min-[810px]:hidden justify-center gap-6 py-3 pb-7",
        className,
      )}
      role="listbox"
      aria-label="Region & language"
      aria-activedescendant={`welcome-lang-${activeOption.code}`}
      {...pauseAutoHandlers}
    >
      {WELCOME_LANGUAGE_OPTIONS.map((option, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={option.code}
            id={isActive ? `welcome-lang-${option.code}` : undefined}
            type="button"
            role="option"
            aria-selected={isActive}
            title={option.title}
            aria-label={`${option.code} — ${option.title}`}
            onClick={() => selectOption(option)}
            className={cn(
              "relative flex items-center gap-1.5 border-0 bg-transparent p-0 text-xs tracking-wide transition-colors",
              isActive
                ? isLight
                  ? "text-[#1a1816]"
                  : "text-white"
                : isLight
                  ? "text-[#1a1816]/40"
                  : "text-white/40",
            )}
          >
            {isActive ? (
              <WelcomeLocaleFlag code={option.code} className="h-3 w-4 shrink-0" />
            ) : null}
            <span>{option.code}</span>
            {isActive ? (
              <span
                className="absolute -right-2.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-primary"
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
      <p className="sr-only" aria-live="polite">
        {welcomeToolbarCode(locale)}
      </p>
    </nav>
  );
}
