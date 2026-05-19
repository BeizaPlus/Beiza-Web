import type { LandingLayoutStudioState } from "./landingLayoutStudioState";

export type HeroFrame = LandingLayoutStudioState["hero"];

export type HeritageHeroFrame = {
  posX: number;
  posY: number;
  scale: number;
  textSide: "left" | "right";
  overlayStrength: number;
  copyRaiseVh: number;
};

export type HeroStudioPage = "events" | "heritage";

export const HERO_STUDIO_DEFAULTS: Record<"events", HeroFrame> = {
  events: { posX: 50, posY: 22, scale: 100, copyBottomVh: 38 },
};

/** Canonical Heritage hero — exported from Layout Studio 2026-05-19. */
export const HERITAGE_HERO_DEFAULTS: HeritageHeroFrame = {
  posX: 80,
  posY: 100,
  scale: 111,
  textSide: "right",
  overlayStrength: 71,
  copyRaiseVh: 0,
};

function storageKey(page: HeroStudioPage) {
  return `beiza-hero-studio:${page}`;
}

export function loadHeroStudioFrame(page: "events"): HeroFrame;
export function loadHeroStudioFrame(page: "heritage"): HeritageHeroFrame;
export function loadHeroStudioFrame(page: HeroStudioPage): HeroFrame | HeritageHeroFrame {
  if (typeof window === "undefined") {
    return page === "heritage" ? HERITAGE_HERO_DEFAULTS : HERO_STUDIO_DEFAULTS.events;
  }
  try {
    const raw = localStorage.getItem(storageKey(page));
    const defaults = page === "heritage" ? HERITAGE_HERO_DEFAULTS : HERO_STUDIO_DEFAULTS.events;
    if (!raw) return defaults;
    return { ...defaults, ...(JSON.parse(raw) as Partial<HeroFrame & HeritageHeroFrame>) };
  } catch {
    return page === "heritage" ? HERITAGE_HERO_DEFAULTS : HERO_STUDIO_DEFAULTS.events;
  }
}

export function saveHeroStudioFrame(page: "events", frame: HeroFrame): void;
export function saveHeroStudioFrame(page: "heritage", frame: HeritageHeroFrame): void;
export function saveHeroStudioFrame(page: HeroStudioPage, frame: HeroFrame | HeritageHeroFrame) {
  localStorage.setItem(storageKey(page), JSON.stringify(frame));
}

export function heroStudioCssVars(frame: HeroFrame): Record<string, string> {
  return {
    "--hero-bg-pos-x": `${frame.posX}%`,
    "--hero-bg-pos-y": `${frame.posY}%`,
    "--hero-bg-scale": `${frame.scale}%`,
    "--hero-copy-raise": `${frame.copyBottomVh}`,
  };
}

export function heritageHeroStudioCssVars(frame: HeritageHeroFrame): Record<string, string> {
  const opacity = frame.overlayStrength / 100;
  const desktop =
    frame.textSide === "right"
      ? `linear-gradient(to left, rgba(0,0,0,${opacity}) 45%, rgba(0,0,0,0.1) 100%)`
      : `linear-gradient(to right, rgba(0,0,0,${opacity}) 45%, rgba(0,0,0,0.1) 100%)`;

  return {
    "--hero-bg-pos-x": `${frame.posX}%`,
    "--hero-bg-pos-y": `${frame.posY}%`,
    "--hero-bg-scale": `${frame.scale}%`,
    "--heritage-overlay-md": desktop,
    "--heritage-overlay-mobile":
      "linear-gradient(to top, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.1) 100%)",
  };
}

export function heritageHeroFrameToImageStyle(frame: HeritageHeroFrame) {
  return {
    objectPosition: `${frame.posX}% ${frame.posY}%`,
    transform: frame.scale !== 100 ? `scale(${frame.scale / 100})` : undefined,
    transformOrigin: `${frame.posX}% ${frame.posY}%`,
  };
}

export function heroStudioToJson(page: HeroStudioPage, frame: HeroFrame | HeritageHeroFrame) {
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

export function downloadHeroStudioJson(page: HeroStudioPage, frame: HeroFrame | HeritageHeroFrame) {
  const blob = new Blob([heroStudioToJson(page, frame)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `hero-layout-${page}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
