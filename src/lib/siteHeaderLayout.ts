import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { sitePaddingX } from "@/lib/siteLayout";
import { cn } from "@/lib/utils";

/** CSS variable consumed by record viewport, studio banners, etc. */
export const SITE_HEADER_HEIGHT_VAR = "--site-header-h";

/** pt 38px + logo row + bottom padding — keep record hero offset in sync */
export const SITE_HEADER_HEIGHT = "5.5rem";

export const SITE_HEADER_TOP_PADDING = "pt-[38px]";
export const SITE_HEADER_BOTTOM_PADDING = "pb-4 sm:pb-5";

/** Default + record overlay — site gutter + shared vertical rhythm */
export function siteHeaderInnerClass(options?: { cinematic?: boolean }) {
  return cn(
    SITE_HEADER_TOP_PADDING,
    SITE_HEADER_BOTTOM_PADDING,
    options?.cinematic ? "px-12" : sitePaddingX,
  );
}

export type SiteHeaderMode = "default" | "cinematic" | "recordOverlay";

export function resolveSiteHeaderMode(pathname: string): SiteHeaderMode {
  if (pathname.startsWith(BEIZA_LINKS.legacy.recordStation)) return "recordOverlay";
  if (pathname === "/" || pathname === BEIZA_LINKS.home.educationHome) return "cinematic";
  return "default";
}

export function shouldHideGlobalHeader(pathname: string): boolean {
  return (
    pathname === BEIZA_LINKS.welcome.gate ||
    pathname.startsWith(`${BEIZA_LINKS.admin.base}/`) ||
    pathname === BEIZA_LINKS.admin.base
  );
}
