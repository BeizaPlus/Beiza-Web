import { cn } from "@/lib/utils";

/** Shared layout shells for public marketing pages. */
export const marketingSection = "bg-background py-24 text-foreground lg:py-32";
export const marketingContainer = "mx-auto max-w-6xl px-[5%]";

/** Pill selector (locale, region, etc.) — matches Voices / What We Do. */
export const segmentToggleShell =
  "mx-auto flex w-fit max-w-full shrink-0 gap-1 rounded-full border border-border bg-card p-1";

export function segmentToggleOption(active: boolean) {
  return cn(
    "shrink-0 cursor-pointer rounded-full px-[18px] py-2 text-xs transition-all duration-150",
    active
      ? "bg-primary font-medium text-primary-foreground"
      : "bg-transparent font-normal text-muted-foreground hover:text-subtle",
  );
}

/** Horizontal carousel nav — same as Voices / TestimonialsCarousel. */
export const carouselControlButton =
  "ring-background flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30";

/** Standard marketing card (pricing tier, vault tile, etc.). */
export function marketingCardClassName(options?: {
  featured?: boolean;
  highlight?: boolean;
}) {
  return cn(
    "glass-panel flex flex-col rounded-lg border border-white/10",
    options?.highlight && "ring-1 ring-primary/35",
    options?.featured && "ring-1 ring-primary/20",
  );
}

/** Legacy app surfaces (vault, record, explore). */
export const legacySurface = "rounded-xl border border-border bg-card";
export const legacyFormField =
  "rounded-lg border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20";

/** Gold-accent panel (Keeper upsell, Heritage White Swan). */
export const legacyGoldPanel =
  "rounded-xl border border-primary/30 bg-primary/5 p-4 md:p-5";
