import { useLocaleContext } from "@/context/LocaleContext";
import { detectLocaleFromNavigator } from "@/lib/locale/detectLocale";
import type { BeizaLocale } from "@/lib/locale/types";

/**
 * Active session locale (persisted in localStorage).
 * Use `detectLocaleFromNavigator` only before provider hydrates.
 */
export function useLocale(): BeizaLocale {
  return useLocaleContext().locale;
}

export { detectLocaleFromNavigator };
