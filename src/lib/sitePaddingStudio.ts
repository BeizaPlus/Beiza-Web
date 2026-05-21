/** Global left/right gutter + inner indent — Heritage sets the standard */

export type SitePaddingFrame = {
  /** Hard boundary each side (rem) — nav, footer, tab bar, heroes */
  paddingXRem: number;
  /** Extra inset inside the boundary for hero copy / columns (rem) */
  contentIndentRem: number;
};

export const SITE_PADDING_DEFAULTS: SitePaddingFrame = {
  paddingXRem: 6.75,
  contentIndentRem: 0,
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

const GUIDES_LIVE_KEY = "beiza-indent-guides-live";
const GUIDES_VISIBLE_KEY = "beiza-site-guides-visible";

/** Yellow site bounds + cyan indent rulers (layout studio preview) */
export function loadSiteGuidesVisible(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(GUIDES_VISIBLE_KEY);
    if (raw === "0") return false;
    return true;
  } catch {
    return true;
  }
}

export function saveSiteGuidesVisible(visible: boolean) {
  localStorage.setItem(GUIDES_VISIBLE_KEY, visible ? "1" : "0");
}

/** false = cyan lines measure only; true = drag pushes copy live */
export function loadIndentGuidesLive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(GUIDES_LIVE_KEY);
    if (raw === null) return false;
    return raw === "1";
  } catch {
    return false;
  }
}

export function saveIndentGuidesLive(live: boolean) {
  localStorage.setItem(GUIDES_LIVE_KEY, live ? "1" : "0");
}
