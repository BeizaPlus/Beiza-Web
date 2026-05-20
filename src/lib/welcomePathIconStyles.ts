/**
 * Welcome gate icon circles — backgrounds and icon colors from site palette tokens only.
 * Legacy: accent-mint · Education: primary (gold) · Farewell: secondary (no blue token on marketing theme)
 */
export const welcomePathIconCircleClass = {
  legacy: "bg-[hsl(var(--welcome-icon-legacy-bg))] text-[hsl(var(--welcome-icon-legacy-fg))]",
  farewell: "bg-[hsl(var(--welcome-icon-farewell-bg))] text-[hsl(var(--welcome-icon-farewell-fg))]",
  education: "bg-[hsl(var(--welcome-icon-education-bg))] text-[hsl(var(--welcome-icon-education-fg))]",
} as const;
