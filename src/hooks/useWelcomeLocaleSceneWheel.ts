import { useEffect, type RefObject } from "react";
import { useLocaleContext } from "@/context/LocaleContext";
import {
  dispatchWelcomeSceneStep,
  shouldIgnoreWelcomeWheelTarget,
  stepWelcomeLocale,
} from "@/lib/welcomeSceneWheel";

const WHEEL_THRESHOLD = 48;
const COOLDOWN_MS = 520;

/**
 * Wheel anywhere on the welcome gate steps region/locale (scene change).
 * Page stays one viewport — no document scroll.
 */
export function useWelcomeLocaleSceneWheel(rootRef: RefObject<HTMLElement | null>, enabled = true) {
  const { locale, setLocale, localePinned } = useLocaleContext();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;

    let accumulated = 0;
    let cooldownUntil = 0;

    const onWheel = (e: WheelEvent) => {
      if (shouldIgnoreWelcomeWheelTarget(e.target)) return;
      if (localePinned || Date.now() < cooldownUntil) return;

      accumulated += e.deltaY;
      if (Math.abs(accumulated) < WHEEL_THRESHOLD) return;

      e.preventDefault();

      const direction: 1 | -1 = accumulated > 0 ? 1 : -1;
      accumulated = 0;
      cooldownUntil = Date.now() + COOLDOWN_MS;

      const next = stepWelcomeLocale(locale, direction);
      if (next !== locale) {
        dispatchWelcomeSceneStep();
        setLocale(next);
      }
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [rootRef, enabled, locale, localePinned, setLocale]);
}
