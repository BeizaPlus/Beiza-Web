import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { detectLocaleFromNavigator, normalizeStoredLocale } from "@/lib/locale/detectLocale";
import type { BeizaLocale } from "@/lib/locale/types";
import { BEIZA_DEFAULT_LOCALE } from "@/lib/locale/welcomeLanguageOptions";
import { LOCALE_PINNED_KEY, LOCALE_STORAGE_KEY } from "@/lib/locale/types";

type LocaleContextValue = {
  locale: BeizaLocale;
  /** Saved localization is locked — auto-detect will not override on load */
  localePinned: boolean;
  setLocale: (locale: BeizaLocale) => void;
  setLocalePinned: (pinned: boolean) => void;
  ready: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): BeizaLocale | null {
  if (typeof window === "undefined") return null;
  return normalizeStoredLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
}

function readPinned(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LOCALE_PINNED_KEY) === "1";
}

function resolveInitialLocale(): BeizaLocale {
  const stored = readStoredLocale();
  const pinned = readPinned();
  if (pinned && stored) return stored;
  if (!pinned) return detectLocaleFromNavigator();
  return stored ?? detectLocaleFromNavigator();
}

function getInitialState(): {
  locale: BeizaLocale;
  localePinned: boolean;
  ready: boolean;
} {
  if (typeof window === "undefined") {
    return { locale: BEIZA_DEFAULT_LOCALE, localePinned: false, ready: false };
  }
  return {
    locale: resolveInitialLocale(),
    localePinned: readPinned(),
    ready: true,
  };
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const initial = getInitialState();
  const [locale, setLocaleState] = useState<BeizaLocale>(initial.locale ?? BEIZA_DEFAULT_LOCALE);
  const [localePinned, setLocalePinnedState] = useState(initial.localePinned);
  const [ready, setReady] = useState(initial.ready);

  useEffect(() => {
    const resolved = resolveInitialLocale();
    setLocaleState(resolved);
    setLocalePinnedState(readPinned());
    localStorage.setItem(LOCALE_STORAGE_KEY, resolved);
    setReady(true);
  }, []);

  const setLocale = useCallback((next: BeizaLocale) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  }, []);

  const setLocalePinned = useCallback((pinned: boolean) => {
    setLocalePinnedState(pinned);
    localStorage.setItem(LOCALE_PINNED_KEY, pinned ? "1" : "0");
    if (!pinned) {
      const detected = detectLocaleFromNavigator();
      setLocaleState(detected);
      localStorage.setItem(LOCALE_STORAGE_KEY, detected);
    }
  }, []);

  const value = useMemo(
    () => ({ locale, localePinned, setLocale, setLocalePinned, ready }),
    [locale, localePinned, setLocale, setLocalePinned, ready],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocaleContext must be used within LocaleProvider");
  }
  return ctx;
}
