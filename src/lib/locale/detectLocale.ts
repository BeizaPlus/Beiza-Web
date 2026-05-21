import type { BeizaLocale } from "@/lib/locale/types";
import { LOCALE_STORAGE_ALIASES } from "@/lib/locale/types";
import { BEIZA_DEFAULT_LOCALE } from "@/lib/locale/welcomeLanguageOptions";

/** Detect regional locale from browser language settings. */
export function detectLocaleFromNavigator(): BeizaLocale {
  if (typeof navigator === "undefined") return BEIZA_DEFAULT_LOCALE;

  const lang = navigator.language || navigator.languages?.[0] || "en";
  const locale = lang.toLowerCase();

  if (locale.startsWith("fr")) return "fr";

  if (locale.startsWith("pt")) return "brazilian";

  if (locale.startsWith("es") || locale.startsWith("gl")) {
    return "latina";
  }

  if (locale.startsWith("zh")) return "chinese";

  if (
    locale === "en-in" ||
    locale.startsWith("hi") ||
    locale.startsWith("bn") ||
    locale.startsWith("ta") ||
    locale.startsWith("te") ||
    locale.startsWith("mr") ||
    locale.startsWith("gu") ||
    locale.startsWith("pa") ||
    locale.startsWith("kn") ||
    locale.startsWith("ml")
  ) {
    return "indian";
  }

  if (
    locale === "en-gh" ||
    locale === "en-ng" ||
    locale === "en-ke" ||
    locale === "en-za" ||
    locale === "en-ug" ||
    locale === "en-tz" ||
    locale === "tw" ||
    locale === "ak" ||
    locale.startsWith("yo") ||
    locale.startsWith("ig") ||
    locale.startsWith("ha") ||
    locale.startsWith("sw")
  ) {
    return "africa";
  }

  return BEIZA_DEFAULT_LOCALE;
}

const LOCALE_SET = new Set<string>([
  "black-american",
  "indian",
  "latina",
  "chinese",
  "brazilian",
  "africa",
  "fr",
]);

export function normalizeStoredLocale(value: string | null): BeizaLocale | null {
  if (!value) return null;
  const aliased = LOCALE_STORAGE_ALIASES[value];
  if (aliased) return aliased;
  if (LOCALE_SET.has(value)) return value as BeizaLocale;
  return null;
}

export function isBeizaLocale(value: string | null): value is BeizaLocale {
  return normalizeStoredLocale(value) !== null;
}
