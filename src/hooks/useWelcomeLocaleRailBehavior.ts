import { useCallback, useEffect, useRef } from "react";
import { useLocaleContext } from "@/context/LocaleContext";
import {
  WELCOME_LANGUAGE_OPTIONS,
  type WelcomeLanguageOption,
} from "@/lib/locale/welcomeLanguageOptions";
import {
  DEFAULT_LOCALE_RAIL_LAYOUT,
  type LocaleRailLayout,
} from "@/lib/welcomeStudio";
import { WELCOME_SCENE_STEP_EVENT } from "@/lib/welcomeSceneWheel";

/** Shared locale selection + auto-rotate (welcome side rail + mobile lang row). */
export function useWelcomeLocaleRailBehavior(
  rail: LocaleRailLayout = DEFAULT_LOCALE_RAIL_LAYOUT,
) {
  const { locale, setLocale, localePinned } = useLocaleContext();
  const pauseAutoRef = useRef(false);

  const activeIndex = Math.max(
    0,
    WELCOME_LANGUAGE_OPTIONS.findIndex((o) => o.locale === locale),
  );
  const activeOption = WELCOME_LANGUAGE_OPTIONS[activeIndex];
  const autoMs = Math.max(1, rail.autoRotateSec) * 1000;

  const selectOption = useCallback(
    (option: WelcomeLanguageOption) => {
      setLocale(option.locale);
    },
    [setLocale],
  );

  useEffect(() => {
    const pause = () => {
      pauseAutoRef.current = true;
      window.setTimeout(() => {
        pauseAutoRef.current = false;
      }, 6000);
    };
    window.addEventListener(WELCOME_SCENE_STEP_EVENT, pause);
    return () => window.removeEventListener(WELCOME_SCENE_STEP_EVENT, pause);
  }, []);

  useEffect(() => {
    if (localePinned) return;
    const id = window.setInterval(() => {
      if (pauseAutoRef.current) return;
      const next = (activeIndex + 1) % WELCOME_LANGUAGE_OPTIONS.length;
      selectOption(WELCOME_LANGUAGE_OPTIONS[next]);
    }, autoMs);
    return () => window.clearInterval(id);
  }, [activeIndex, autoMs, localePinned, selectOption]);

  const pauseAutoHandlers = {
    onPointerEnter: () => {
      pauseAutoRef.current = true;
    },
    onPointerLeave: () => {
      pauseAutoRef.current = false;
    },
  };

  return {
    locale,
    activeIndex,
    activeOption,
    selectOption,
    pauseAutoHandlers,
  };
}
