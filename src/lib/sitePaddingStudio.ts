/** Global left/right gutter + inner indent — Heritage sets the standard */

export type SitePaddingFrame = {
  /** Hard boundary each side (rem) — nav, footer, tab bar, heroes */
  paddingXRem: number;
  /** Extra inset inside the boundary for hero copy / columns (rem) */
  contentIndentRem: number;
};

export const SITE_PADDING_DEFAULTS: SitePaddingFrame = {
  paddingXRem: 6.75,
  contentIndentRem: 1,
};

const STORAGE_KEY = "beiza-site-padding-studio";

export function loadSitePaddingFrame(): SitePaddingFrame {
  if (typeof window === "undefined") return { ...SITE_PADDING_DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...SITE_PADDING_DEFAULTS };
    const parsed = { ...SITE_PADDING_DEFAULTS, ...(JSON.parse(raw) as Partial<SitePaddingFrame>) };
    if (parsed.contentIndentRem === undefined) parsed.contentIndentRem = SITE_PADDING_DEFAULTS.contentIndentRem;
    return parsed;
  } catch {
    return { ...SITE_PADDING_DEFAULTS };
  }
}

export function saveSitePaddingFrame(frame: SitePaddingFrame) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(frame));
}

export function applySitePaddingCssVar(frame: SitePaddingFrame) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty(
    "--beiza-site-padding-x",
    `${frame.paddingXRem}rem`,
  );
  document.documentElement.style.setProperty(
    "--beiza-content-indent",
    `${frame.contentIndentRem}rem`,
  );
}

export function sitePaddingPx(frame: SitePaddingFrame): number {
  return Math.round(frame.paddingXRem * 16);
}

export function siteContentIndentPx(frame: SitePaddingFrame): number {
  return Math.round(frame.contentIndentRem * 16);
}
