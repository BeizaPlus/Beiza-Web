import type { LandingLayoutStudioState } from "./landingLayoutStudioState";

export type HeroFrame = LandingLayoutStudioState["hero"];

export type HeroStudioPage = "events" | "heritage";

export const HERO_STUDIO_DEFAULTS: Record<HeroStudioPage, HeroFrame> = {
  events: { posX: 50, posY: 22, scale: 100, copyBottomVh: 38 },
  heritage: { posX: 72, posY: 50, scale: 100, copyBottomVh: 38 },
};

function storageKey(page: HeroStudioPage) {
  return `beiza-hero-studio:${page}`;
}

export function loadHeroStudioFrame(page: HeroStudioPage): HeroFrame {
  if (typeof window === "undefined") return HERO_STUDIO_DEFAULTS[page];
  try {
    const raw = localStorage.getItem(storageKey(page));
    if (!raw) return HERO_STUDIO_DEFAULTS[page];
    return { ...HERO_STUDIO_DEFAULTS[page], ...(JSON.parse(raw) as Partial<HeroFrame>) };
  } catch {
    return HERO_STUDIO_DEFAULTS[page];
  }
}

export function saveHeroStudioFrame(page: HeroStudioPage, frame: HeroFrame) {
  localStorage.setItem(storageKey(page), JSON.stringify(frame));
}

export function heroStudioCssVars(frame: HeroFrame): Record<string, string> {
  return {
    "--hero-bg-pos-x": `${frame.posX}%`,
    "--hero-bg-pos-y": `${frame.posY}%`,
    "--hero-bg-scale": `${frame.scale}%`,
    "--hero-copy-bottom": `${frame.copyBottomVh}vh`,
  };
}

export function heroStudioToJson(page: HeroStudioPage, frame: HeroFrame) {
  return JSON.stringify(
    {
      savedAt: new Date().toISOString(),
      label: `Beiza hero layout · ${page}`,
      page,
      hero: frame,
    },
    null,
    2,
  );
}

export function downloadHeroStudioJson(page: HeroStudioPage, frame: HeroFrame) {
  const blob = new Blob([heroStudioToJson(page, frame)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `hero-layout-${page}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
