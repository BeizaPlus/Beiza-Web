import {
  DEFAULT_PRICING_CONTENT,
  mergePricingContent,
  type PricingSectionContent,
} from "@/lib/landingPricingContent";

export type StudioFocus = "hero" | "heritageHero" | "offerings" | "faq" | "pricing" | "outro";

export type LandingLayoutStudioState = {
  focus: StudioFocus;
  hero: { posX: number; posY: number; scale: number; copyBottomVh: number };
  offerings: { offsetY: number; paddingTop: number };
  faq: { offsetY: number; paddingTop: number };
  pricing: { offsetY: number; paddingTop: number };
  outro: { offsetY: number; paddingTop: number };
  pricingContent: PricingSectionContent;
};

/** Canonical homepage layout — exported from Layout Studio 2026-05-19. */
export const DEFAULT_STUDIO_STATE: LandingLayoutStudioState = {
  focus: "hero",
  hero: { posX: 18, posY: 84, scale: 106, copyBottomVh: 18 },
  offerings: { offsetY: -32, paddingTop: 80 },
  faq: { offsetY: -48, paddingTop: 72 },
  pricing: { offsetY: 0, paddingTop: 96 },
  outro: { offsetY: 0, paddingTop: 96 },
  pricingContent: DEFAULT_PRICING_CONTENT,
};

const STORAGE_KEY = "beiza-landing-layout-studio-v3";

export function mergeStudioState(partial: Partial<LandingLayoutStudioState>): LandingLayoutStudioState {
  return {
    ...DEFAULT_STUDIO_STATE,
    ...partial,
    hero: { ...DEFAULT_STUDIO_STATE.hero, ...partial.hero },
    offerings: { ...DEFAULT_STUDIO_STATE.offerings, ...partial.offerings },
    faq: { ...DEFAULT_STUDIO_STATE.faq, ...partial.faq },
    pricing: { ...DEFAULT_STUDIO_STATE.pricing, ...partial.pricing },
    outro: { ...DEFAULT_STUDIO_STATE.outro, ...partial.outro },
    pricingContent: mergePricingContent(partial.pricingContent),
  };
}

export function loadStudioState(): LandingLayoutStudioState {
  if (typeof window === "undefined") return DEFAULT_STUDIO_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STUDIO_STATE;
    return mergeStudioState(JSON.parse(raw) as Partial<LandingLayoutStudioState>);
  } catch {
    return DEFAULT_STUDIO_STATE;
  }
}

export function studioStateToJson(state: LandingLayoutStudioState, meta?: Record<string, string>) {
  return JSON.stringify(
    {
      savedAt: new Date().toISOString(),
      label: "Beiza landing layout studio",
      ...meta,
      layout: state,
    },
    null,
    2,
  );
}

export function downloadStudioJson(state: LandingLayoutStudioState, filename = "landing-layout.json") {
  const blob = new Blob([studioStateToJson(state)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function saveStudioState(state: LandingLayoutStudioState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function studioCssVars(state: LandingLayoutStudioState): Record<string, string> {
  return {
    "--hero-bg-pos-x": `${state.hero.posX}%`,
    "--hero-bg-pos-y": `${state.hero.posY}%`,
    "--hero-bg-scale": `${state.hero.scale}%`,
    "--hero-copy-raise": `${state.hero.copyBottomVh}`,
    "--offerings-offset-y": `${state.offerings.offsetY}px`,
    "--offerings-padding-top": `${state.offerings.paddingTop}px`,
    "--faq-offset-y": `${state.faq.offsetY}px`,
    "--faq-padding-top": `${state.faq.paddingTop}px`,
    "--pricing-offset-y": `${state.pricing.offsetY}px`,
    "--pricing-padding-top": `${state.pricing.paddingTop}px`,
    "--outro-offset-y": `${state.outro.offsetY}px`,
    "--outro-padding-top": `${state.outro.paddingTop}px`,
  };
}
