import { cn } from "@/lib/utils";

/**
 * Site layout bounds — Heritage (/farewell) is the reference page.
 *
 * 1. `--beiza-site-padding-x` — hard left/right boundary (nav, footer, tab bar, hero copy).
 *    Nothing interactive should extend past this gutter.
 * 2. `--beiza-content-indent` — extra inset *inside* the gutter for hero copy / columns.
 *
 * Tune both in Layout Studio → Site padding (bottom-right).
 */

export const sitePaddingX =
  "pl-[var(--beiza-site-padding-x,1.25rem)] pr-[var(--beiza-site-padding-x,1.25rem)]";

export const siteContentIndentX =
  "pl-[var(--beiza-content-indent,0rem)] pr-[var(--beiza-content-indent,0rem)]";

/** Outer boundary wrapper — full width, padded, content cannot pass edges */
export const siteBounds = cn("box-border w-full min-w-0 max-w-[100vw]", sitePaddingX);

/** Centered column inside the boundary (marketing sections) */
export const siteBoundedContainer = cn("mx-auto w-full max-w-6xl min-w-0");

/** Marketing section + boundary (replaces ad-hoc px-[5%]) */
export const siteBoundedSection = (sectionClass?: string) =>
  cn(sectionClass, siteBounds);

/** Full-bleed hero copy row — image edge-to-edge, text inside site padding */
export const siteHeroContentRow = cn(
  "relative z-10 flex w-full min-w-0 flex-1",
  sitePaddingX,
);
