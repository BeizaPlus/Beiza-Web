import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import { loadSiteGuidesVisible, saveSiteGuidesVisible } from "@/lib/sitePaddingStudio";
import { cn } from "@/lib/utils";

export const LAYOUT_STUDIO_MASTER_OPEN_EVENT = "beiza:layout-studio-master-open";

export type StudioPanelEntry = {
  id: string;
  label: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

type LayoutStudioContextValue = {
  enabled: boolean;
  /** Master switch — floating HUD panels + edit tools (guides stay visible when off) */
  masterOpen: boolean;
  setMasterOpen: (open: boolean) => void;
  toggleMaster: () => void;
  /** Yellow/cyan site guides preview */
  guidesVisible: boolean;
  setGuidesVisible: (visible: boolean) => void;
  toggleGuides: () => void;
  registerStudioPanel: (entry: StudioPanelEntry) => void;
  unregisterStudioPanel: (id: string) => void;
  dockAllPanels: () => void;
};

const LayoutStudioContext = createContext<LayoutStudioContextValue | null>(null);

const STORAGE_KEY = "beiza-layout-studio-master-open";

function readMasterOpen(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "0") return false;
    if (raw === "1") return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function LayoutStudioProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const onAdmin = pathname.startsWith("/admin");
  const enabled = isLayoutStudioEnabled() && !onAdmin;
  const [masterOpen, setMasterOpenState] = useState(readMasterOpen);
  const [guidesVisible, setGuidesVisibleState] = useState(loadSiteGuidesVisible);
  const [studioPanels, setStudioPanels] = useState<StudioPanelEntry[]>([]);
  const panelsRef = useRef<Map<string, StudioPanelEntry>>(new Map());

  const syncPanels = useCallback(() => {
    setStudioPanels(
      Array.from(panelsRef.current.values()).sort((a, b) => a.label.localeCompare(b.label)),
    );
  }, []);

  const registerStudioPanel = useCallback(
    (entry: StudioPanelEntry) => {
      panelsRef.current.set(entry.id, entry);
      syncPanels();
    },
    [syncPanels],
  );

  const unregisterStudioPanel = useCallback(
    (id: string) => {
      panelsRef.current.delete(id);
      syncPanels();
    },
    [syncPanels],
  );

  const applyMasterOpen = useCallback((open: boolean) => {
    setMasterOpenState(open);
    try {
      localStorage.setItem(STORAGE_KEY, open ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (open) {
      window.dispatchEvent(new CustomEvent(LAYOUT_STUDIO_MASTER_OPEN_EVENT));
    }
  }, []);

  const setMasterOpen = applyMasterOpen;

  const toggleMaster = useCallback(() => {
    setMasterOpenState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      if (next) {
        window.dispatchEvent(new CustomEvent(LAYOUT_STUDIO_MASTER_OPEN_EVENT));
      }
      return next;
    });
  }, []);

  const dockAllPanels = useCallback(() => {
    panelsRef.current.forEach((panel) => {
      if (panel.open) panel.onClose();
    });
  }, []);

  const setGuidesVisible = useCallback((visible: boolean) => {
    setGuidesVisibleState(visible);
    saveSiteGuidesVisible(visible);
  }, []);

  const toggleGuides = useCallback(() => {
    setGuidesVisibleState((prev) => {
      const next = !prev;
      saveSiteGuidesVisible(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    html.classList.toggle("site-padding-guides", guidesVisible);
    html.classList.toggle("layout-studio-master-off", !masterOpen);
    return () => {
      html.classList.remove("site-padding-guides", "layout-studio-master-off");
    };
  }, [enabled, masterOpen, guidesVisible]);

  const value = useMemo(
    () => ({
      enabled,
      masterOpen,
      setMasterOpen,
      toggleMaster,
      guidesVisible,
      setGuidesVisible,
      toggleGuides,
      registerStudioPanel,
      unregisterStudioPanel,
      dockAllPanels,
    }),
    [
      enabled,
      masterOpen,
      setMasterOpen,
      toggleMaster,
      guidesVisible,
      setGuidesVisible,
      toggleGuides,
      registerStudioPanel,
      unregisterStudioPanel,
      dockAllPanels,
    ],
  );

  return (
    <LayoutStudioContext.Provider value={value}>
      {children}
      {enabled ? (
        <LayoutStudioControls panels={studioPanels} masterOpen={masterOpen} setMasterOpen={setMasterOpen} />
      ) : null}
    </LayoutStudioContext.Provider>
  );
}

function LayoutStudioControls({
  panels,
  masterOpen,
  setMasterOpen,
}: {
  panels: StudioPanelEntry[];
  masterOpen: boolean;
  setMasterOpen: (open: boolean) => void;
}) {
  const { toggleMaster, dockAllPanels, guidesVisible, toggleGuides } = useLayoutStudio();

  const ensureMasterOpen = useCallback(() => {
    if (!masterOpen) setMasterOpen(true);
  }, [masterOpen, setMasterOpen]);

  const controls = (
    <div
      className="fixed bottom-4 left-4 z-[9998] flex max-w-[min(100vw-2rem,20rem)] flex-col items-start gap-2"
      data-beiza-layout-studio-controls
    >
      {panels.length > 0 ? (
        <div
          className="flex w-full flex-col gap-1.5 rounded-lg border border-white/15 bg-black/90 p-2 shadow-lg backdrop-blur-sm"
          role="toolbar"
          aria-label="Studio panel dock"
        >
          <div className="flex items-center justify-between gap-2 px-0.5">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-white/50">
              Panels
            </span>
            <button
              type="button"
              onClick={dockAllPanels}
              className="rounded border border-[#E6A817]/35 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#f5c518] hover:bg-[#E6A817]/20"
            >
              Dock all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {panels.map((panel) => {
              const visible = panel.open && masterOpen;
              return (
                <button
                  key={panel.id}
                  type="button"
                  aria-pressed={visible}
                  onClick={() => {
                    if (visible) {
                      panel.onClose();
                      return;
                    }
                    ensureMasterOpen();
                    panel.onOpen();
                  }}
                  className={cn(
                    "rounded-md border px-2 py-1 text-[10px] font-medium transition",
                    visible
                      ? "border-[#f5c518]/70 bg-[#E6A817]/35 text-[#f5c518] ring-1 ring-[#f5c518]/40"
                      : "border-[#E6A817]/40 bg-[#E6A817]/15 text-[#f5c518] hover:bg-[#E6A817]/30",
                  )}
                >
                  {panel.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-beiza-layout-studio-guides-toggle
          onClick={(e) => {
            e.stopPropagation();
            toggleGuides();
          }}
          className={cn(
            "rounded-full px-3 py-2 text-[11px] font-semibold tracking-wide shadow-lg transition",
            guidesVisible
              ? "bg-cyan-500/25 text-cyan-100 ring-2 ring-cyan-400/70 ring-offset-2 ring-offset-black"
              : "border border-white/20 bg-black/80 text-white/55 hover:text-white/80",
          )}
          aria-pressed={guidesVisible}
          aria-label={guidesVisible ? "Hide site guides" : "Show site guides"}
          title="Yellow site bounds + cyan indent rulers"
        >
          Guides
        </button>
        <button
          type="button"
          data-beiza-layout-studio-master
          onClick={(e) => {
            e.stopPropagation();
            toggleMaster();
          }}
          className={cn(
            "rounded-full px-4 py-2.5 text-xs font-semibold tracking-wide shadow-lg transition",
            masterOpen
              ? "bg-[#f5c518] text-[#0a0a0a] ring-2 ring-white/90 ring-offset-2 ring-offset-black"
              : "bg-[#E6A817] text-[#0a0a0a] hover:bg-[#f5c518]",
          )}
          aria-pressed={masterOpen}
          aria-label={masterOpen ? "Hide all layout studio panels" : "Show layout studio panels"}
        >
          Layout studio
        </button>
      </div>
    </div>
  );

  if (typeof document === "undefined") return controls;
  return createPortal(controls, document.body);
}

export function useLayoutStudio(): LayoutStudioContextValue {
  const ctx = useContext(LayoutStudioContext);
  return (
    ctx ?? {
      enabled: false,
      masterOpen: false,
      setMasterOpen: () => {},
      toggleMaster: () => {},
      guidesVisible: false,
      setGuidesVisible: () => {},
      toggleGuides: () => {},
      registerStudioPanel: () => {},
      unregisterStudioPanel: () => {},
      dockAllPanels: () => {},
    }
  );
}
