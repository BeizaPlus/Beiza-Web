/** Character shown on the welcome gate center (Legacy) card + record hero */
export type BeizaCharacterLocale =
  | "black-american"
  | "indian"
  | "latina"
  | "chinese"
  | "brazilian";

export type BeizaLocale = BeizaCharacterLocale | "africa" | "fr";

export const BEIZA_CHARACTER_LOCALES: BeizaCharacterLocale[] = [
  "black-american",
  "indian",
  "latina",
  "chinese",
  "brazilian",
];

export const BEIZA_LOCALES: BeizaLocale[] = [...BEIZA_CHARACTER_LOCALES, "africa", "fr"];

export type WelcomePathKey = "legacy" | "farewell" | "education";

export const LOCALE_STORAGE_KEY = "beiza-locale";

/** When true, saved locale wins on load; when false, browser detection sets language */
export const LOCALE_PINNED_KEY = "beiza-locale-pinned";

/** Legacy localStorage values from earlier builds */
export const LOCALE_STORAGE_ALIASES: Record<string, BeizaLocale> = {
  en: "black-american",
  india: "indian",
  global: "africa",
  gh: "africa",
  ghana: "africa",
  es: "latina",
  cn: "chinese",
  zh: "chinese",
};
