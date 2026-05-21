import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";

type StudioTextEditContextValue = {
  /** Layout studio is available on this load (localhost or ?studio=1) */
  studioEnabled: boolean;
  /** document.designMode is on — click any visible copy to edit */
  active: boolean;
  setActive: (on: boolean) => void;
  toggle: () => void;
};

const StudioTextEditContext = createContext<StudioTextEditContextValue | null>(null);

function applyDesignMode(on: boolean) {
  if (typeof document === "undefined") return;
  document.designMode = on ? "on" : "off";
}

export function StudioTextEditProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const studioEnabled = isLayoutStudioEnabled();
  const [active, setActive] = useState(false);

  const onAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (!studioEnabled || onAdmin) {
      setActive(false);
      applyDesignMode(false);
    }
  }, [studioEnabled, onAdmin, location.pathname]);

  useEffect(() => {
    if (!studioEnabled || onAdmin) return;
    applyDesignMode(active);
  }, [active, studioEnabled, onAdmin]);

  useEffect(() => () => applyDesignMode(false), []);

  const toggle = useCallback(() => setActive((prev) => !prev), []);

  const value = useMemo(
    () => ({ studioEnabled: studioEnabled && !onAdmin, active, setActive, toggle }),
    [studioEnabled, onAdmin, active, toggle],
  );

  return <StudioTextEditContext.Provider value={value}>{children}</StudioTextEditContext.Provider>;
}

export function useStudioTextEdit(): StudioTextEditContextValue {
  const ctx = useContext(StudioTextEditContext);
  if (!ctx) {
    throw new Error("useStudioTextEdit must be used within StudioTextEditProvider");
  }
  return ctx;
}

/** Safe when provider may be absent (e.g. tests) */
export function useStudioTextEditOptional() {
  return useContext(StudioTextEditContext);
}
