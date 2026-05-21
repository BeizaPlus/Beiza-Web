import type { BeizaLocale } from "@/lib/locale/types";

export type WelcomeLanguageCode = "GH" | "EN" | "ES" | "FR" | "CN";

export type WelcomeLanguageOption = {
  locale: BeizaLocale;
  code: WelcomeLanguageCode;
  /** Screen reader + tooltip */
  title: string;
};

/** Welcome pill bar — Global = Ghana (GH) default, then EN / ES / FR / CN */
export const WELCOME_LANGUAGE_OPTIONS: WelcomeLanguageOption[] = [
  { locale: "africa", code: "GH", title: "Ghana — same record tool, translated UI" },
  { locale: "black-american", code: "EN", title: "English" },
  { locale: "latina", code: "ES", title: "Spanish" },
  { locale: "fr", code: "FR", title: "French" },
  { locale: "chinese", code: "CN", title: "Chinese" },
];

/** Map stored locale to one of the five toolbar codes */
export function welcomeToolbarCode(locale: BeizaLocale): WelcomeLanguageCode {
  if (locale === "africa") return "GH";
  if (locale === "latina") return "ES";
  if (locale === "fr") return "FR";
  if (locale === "chinese") return "CN";
  return "EN";
}

export function localeForWelcomeCode(code: WelcomeLanguageCode): BeizaLocale {
  return WELCOME_LANGUAGE_OPTIONS.find((o) => o.code === code)!.locale;
}

export const BEIZA_DEFAULT_LOCALE: BeizaLocale = "africa";
