/**
 * Welcome gate icon circles — backgrounds and icon colors from site palette tokens only.
 * Legacy · Education · Farewell — primary gold on hover
 */
export const welcomePathIconCircleClass = {
  legacy: "bg-[hsl(var(--welcome-icon-legacy-bg))] text-[hsl(var(--welcome-icon-legacy-fg))]",
  farewell: "bg-[hsl(var(--welcome-icon-farewell-bg))] text-[hsl(var(--welcome-icon-farewell-fg))]",
  education: "bg-[hsl(var(--welcome-icon-education-bg))] text-[hsl(var(--welcome-icon-education-fg))]",
} as const;

/** Icon color only — used when circle background is hidden */
export const welcomePathIconFgClass = {
  legacy: "text-[hsl(var(--welcome-icon-legacy-fg))]",
  farewell: "text-[hsl(var(--welcome-icon-farewell-fg))]",
  education: "text-[hsl(var(--welcome-icon-education-fg))]",
} as const;

/** Resting icon — neutral; on card hover, path accent applies */
export const welcomePathIconIdleClass = "text-white/50";

/** Per-path icon stroke color on hover — no background tint */
export const welcomePathIconHoverFgClass = {
  legacy: "group-hover:text-[hsl(var(--welcome-icon-legacy-fg))]",
  education: "group-hover:text-[hsl(var(--welcome-icon-education-fg))]",
  farewell: "group-hover:text-[hsl(var(--welcome-icon-farewell-fg))]",
} as const;

/** Optional circle fill — only when “Icon circle background” is on */
export const welcomePathIconHoverBgClass = {
  legacy: "group-hover:bg-[hsl(var(--welcome-icon-legacy-bg))]",
  education: "group-hover:bg-[hsl(var(--welcome-icon-education-bg))]",
  farewell: "group-hover:bg-[hsl(var(--welcome-icon-farewell-bg))]",
} as const;
