import type { BeizaLocale } from "@/lib/locale/types";
import { WELCOME_LANGUAGE_OPTIONS } from "@/lib/locale/welcomeLanguageOptions";

/** Fired when user steps locale via wheel — pauses auto-rotate on the rail */
export const WELCOME_SCENE_STEP_EVENT = "beiza:welcome-scene-step";

export function dispatchWelcomeSceneStep() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(WELCOME_SCENE_STEP_EVENT));
  }
}

export function stepWelcomeLocale(current: BeizaLocale, direction: 1 | -1): BeizaLocale {
  const len = WELCOME_LANGUAGE_OPTIONS.length;
  const idx = Math.max(0, WELCOME_LANGUAGE_OPTIONS.findIndex((o) => o.locale === current));
  const next = (idx + direction + len) % len;
  return WELCOME_LANGUAGE_OPTIONS[next].locale;
}

export function shouldIgnoreWelcomeWheelTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return !!target.closest(
    '[data-beiza-studio-panel],textarea,input,select,[contenteditable="true"]',
  );
}
