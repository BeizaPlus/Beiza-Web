import { cn } from "@/lib/utils";

/**
 * Site layout bounds — Heritage (/farewell) is the reference page.
 *
 * 1. **Yellow guides** — `--beiza-site-padding-x` (site boundary). Nav, footer, tab bar align here.
 * 2. **Cyan guides** — boundary + `--beiza-content-indent`. **Hero copy starts on the cyan line**
 *    (left-aligned: left edge of headline; right-aligned: right edge of block).
 *
 * Tune both in Layout Studio → Site bounds (bottom-right).
 */

export const sitePaddingX =
  "pl-[var(--beiza-site-padding-x,1.25rem)] pr-[var(--beiza-site-padding-x,1.25rem)]";

export const siteContentIndentX =
  "pl-[var(--beiza-content-indent,0rem)] pr-[var(--beiza-content-indent,0rem)]";

/** Combined inset to the cyan guide — use for hero shells and copy rows. */
export const siteHeroCopyInsetX =
  "pl-[calc(var(--beiza-site-padding-x,1.25rem)+var(--beiza-content-indent,0rem))] pr-[calc(var(--beiza-site-padding-x,1.25rem)+var(--beiza-content-indent,0rem))]";

export const siteHeroCopyMaxWidth =
  "max-w-[min(42rem,calc(100vw-2*(var(--beiza-site-padding-x,1.25rem)+var(--beiza-content-indent,0rem))))]";

/** Outer boundary wrapper — full width, padded, content cannot pass edges */
export const siteBounds = cn("box-border w-full min-w-0 max-w-[100vw]", sitePaddingX);

/** Centered column inside the boundary (marketing sections) */
export const siteBoundedContainer = cn("mx-auto w-full max-w-6xl min-w-0");

/** Marketing section + boundary (replaces ad-hoc px-[5%]) */
export const siteBoundedSection = (sectionClass?: string) =>
  cn(sectionClass, siteBounds);

/** Full-bleed hero copy row — image edge-to-edge; copy column starts at cyan guides */
export const siteHeroContentRow = cn(
  "relative z-10 flex w-full min-w-0 flex-1",
  siteHeroCopyInsetX,
);

/** Hero headline block — left or right aligned; never add extra sm:pl-* beyond cyan */
export const siteHeroCopyBlockLeft = cn(
  siteHeroCopyMaxWidth,
  "min-w-0 text-left mr-auto",
);

export const siteHeroCopyBlockRight = cn(
  siteHeroCopyMaxWidth,
  "min-w-0 text-right ml-auto",
);
