import type { LayoutStudioBreakpoint } from "@/lib/layoutBreakpoints";
import { LAYOUT_CANONICAL } from "@/lib/layoutCanonical";

/** Global left/right gutter + inner indent — Heritage sets the standard */

export type SitePaddingFrame = {
  /** Desktop (≥1200px) */
  paddingXRem: number;
  contentIndentRem: number;
  /** Tablet (810–1199px) */
  paddingXRemTablet: number;
  contentIndentRemTablet: number;
  /** Phone (≤639px) */
  paddingXRemPhone: number;
  contentIndentRemPhone: number;
  /** @deprecated migrated to paddingXRemPhone */
  paddingXRemMobile?: number;
  /** @deprecated migrated to contentIndentRemPhone */
  contentIndentRemMobile?: number;
};

export const SITE_PADDING_PHONE_DEFAULTS = {
  paddingXRemPhone: 0.75,
  contentIndentRemPhone: 0,
} as const;

export const SITE_PADDING_TABLET_DEFAULTS = {
  paddingXRemTablet: 1.5,
  contentIndentRemTablet: 0,
} as const;

export const SITE_PADDING_DEFAULTS = LAYOUT_CANONICAL.sitePadding as SitePaddingFrame;

const STORAGE_KEY = "beiza-site-padding-studio";

function migrateSitePaddingFrame(raw: Partial<SitePaddingFrame>): SitePaddingFrame {
  const d = SITE_PADDING_DEFAULTS;
  return {
    paddingXRem: raw.paddingXRem ?? d.paddingXRem,
    contentIndentRem: raw.contentIndentRem ?? d.contentIndentRem,
    paddingXRemTablet: raw.paddingXRemTablet ?? d.paddingXRemTablet,
    contentIndentRemTablet: raw.contentIndentRemTablet ?? d.contentIndentRemTablet,
    paddingXRemPhone:
      raw.paddingXRemPhone ?? raw.paddingXRemMobile ?? SITE_PADDING_PHONE_DEFAULTS.paddingXRemPhone,
    contentIndentRemPhone:
      raw.contentIndentRemPhone ??
      raw.contentIndentRemMobile ??
      SITE_PADDING_PHONE_DEFAULTS.contentIndentRemPhone,
  };
}

export function loadSitePaddingFrame(): SitePaddingFrame {
  if (typeof window === "undefined") return { ...SITE_PADDING_DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...SITE_PADDING_DEFAULTS };
    return migrateSitePaddingFrame(JSON.parse(raw) as Partial<SitePaddingFrame>);
  } catch {
    return { ...SITE_PADDING_DEFAULTS };
  }
}

export function saveSitePaddingFrame(frame: SitePaddingFrame) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(frame));
}

const STUDIO_PADDING_ATTR = "data-beiza-studio-padding";

/** Values for cyan guides + live preview at the current Framer tier */
export function sitePaddingForViewport(
  frame: SitePaddingFrame,
  breakpoint: LayoutStudioBreakpoint,
): SitePaddingFrame {
  switch (breakpoint) {
    case "phone":
      return {
        ...frame,
        paddingXRem: frame.paddingXRemPhone,
        contentIndentRem: frame.contentIndentRemPhone,
      };
    case "tablet":
      return {
        ...frame,
        paddingXRem: frame.paddingXRemTablet,
        contentIndentRem: frame.contentIndentRemTablet,
      };
    default:
      return frame;
  }
}

/** @deprecated use sitePaddingForViewport(frame, breakpoint) */
export function sitePaddingForViewportLegacy(frame: SitePaddingFrame, mobile: boolean): SitePaddingFrame {
  return sitePaddingForViewport(frame, mobile ? "phone" : "desktop");
}

export function applySitePaddingCssVar(frame: SitePaddingFrame, options?: { studioActive?: boolean }) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (options?.studioActive) {
    root.setAttribute(STUDIO_PADDING_ATTR, "1");
    root.style.setProperty("--beiza-studio-pad-x-phone", `${frame.paddingXRemPhone}rem`);
    root.style.setProperty("--beiza-studio-indent-phone", `${frame.contentIndentRemPhone}rem`);
    root.style.setProperty("--beiza-studio-pad-x-tablet", `${frame.paddingXRemTablet}rem`);
    root.style.setProperty("--beiza-studio-indent-tablet", `${frame.contentIndentRemTablet}rem`);
    root.style.setProperty("--beiza-studio-pad-x-desktop", `${frame.paddingXRem}rem`);
    root.style.setProperty("--beiza-studio-indent-desktop", `${frame.contentIndentRem}rem`);
    root.style.removeProperty("--beiza-site-padding-x");
    root.style.removeProperty("--beiza-content-indent");
    return;
  }
  root.removeAttribute(STUDIO_PADDING_ATTR);
  for (const key of [
    "--beiza-studio-pad-x-phone",
    "--beiza-studio-indent-phone",
    "--beiza-studio-pad-x-tablet",
    "--beiza-studio-indent-tablet",
    "--beiza-studio-pad-x-desktop",
    "--beiza-studio-indent-desktop",
    "--beiza-site-padding-x",
    "--beiza-content-indent",
  ]) {
    root.style.removeProperty(key);
  }
}

export function sitePaddingPx(frame: SitePaddingFrame): number {
  return Math.round(frame.paddingXRem * 16);
}

export function siteContentIndentPx(frame: SitePaddingFrame): number {
  return Math.round(frame.contentIndentRem * 16);
}

const GUIDES_LIVE_KEY = "beiza-indent-guides-live";
const GUIDES_VISIBLE_KEY = "beiza-site-guides-visible";

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

export function loadIndentGuidesLive(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(GUIDES_LIVE_KEY);
    if (raw === null) return true;
    return raw === "1";
  } catch {
    return true;
  }
}

export function saveIndentGuidesLive(live: boolean) {
  localStorage.setItem(GUIDES_LIVE_KEY, live ? "1" : "0");
}

/** @deprecated use SITE_PADDING_PHONE_DEFAULTS */
export const SITE_PADDING_MOBILE_DEFAULTS = SITE_PADDING_PHONE_DEFAULTS;

export function sitePaddingIndentForBreakpoint(
  frame: SitePaddingFrame,
  breakpoint: LayoutStudioBreakpoint,
): number {
  switch (breakpoint) {
    case "phone":
      return frame.contentIndentRemPhone;
    case "tablet":
      return frame.contentIndentRemTablet;
    default:
      return frame.contentIndentRem;
  }
}

export function sitePaddingBoundaryForBreakpoint(
  frame: SitePaddingFrame,
  breakpoint: LayoutStudioBreakpoint,
): number {
  switch (breakpoint) {
    case "phone":
      return frame.paddingXRemPhone;
    case "tablet":
      return frame.paddingXRemTablet;
    default:
      return frame.paddingXRem;
  }
}

export function patchSitePaddingIndent(
  breakpoint: LayoutStudioBreakpoint,
  contentIndentRem: number,
): Partial<SitePaddingFrame> {
  switch (breakpoint) {
    case "phone":
      return { contentIndentRemPhone: contentIndentRem };
    case "tablet":
      return { contentIndentRemTablet: contentIndentRem };
    default:
      return { contentIndentRem };
  }
}

export function patchSitePaddingBoundary(
  breakpoint: LayoutStudioBreakpoint,
  paddingXRem: number,
): Partial<SitePaddingFrame> {
  switch (breakpoint) {
    case "phone":
      return { paddingXRemPhone: paddingXRem };
    case "tablet":
      return { paddingXRemTablet: paddingXRem };
    default:
      return { paddingXRem };
  }
}
