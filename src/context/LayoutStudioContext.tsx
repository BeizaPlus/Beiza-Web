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
import { Link, useLocation } from "react-router-dom";
import { isLayoutStudioEnabled, isLegacyStudioPreview } from "@/lib/layoutStudio";
import { loadSiteGuidesVisible, saveSiteGuidesVisible } from "@/lib/sitePaddingStudio";
import { studioControlsDockPosition } from "@/lib/studioPanelPlacement";
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
  /** Id of the only floating panel that may be open, or null when all docked. */
  activePanelId: string | null;
  /** Open one panel (closes all others) and turn layout studio on. */
  openStudioPanel: (panelId: string) => void;
  closeStudioPanel: () => void;
  /** Tuck panel dock + toggles to the left edge so the page layout is unobstructed */
  controlsMinimized: boolean;
  setControlsMinimized: (minimized: boolean) => void;
  toggleControlsMinimized: () => void;
  /** Hide legacy tab rail (Home · Record · Vault…) to preview page unobstructed */
  tabRailHidden: boolean;
  setTabRailHidden: (hidden: boolean) => void;
  toggleTabRailHidden: () => void;
};

const LayoutStudioContext = createContext<LayoutStudioContextValue | null>(null);

const STORAGE_KEY = "beiza-layout-studio-master-open";
const CONTROLS_MINIMIZED_KEY = "beiza-layout-studio-controls-minimized";
const TAB_RAIL_HIDDEN_KEY = "beiza-legacy-tab-rail-hidden";

function readTabRailHidden(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(TAB_RAIL_HIDDEN_KEY);
    if (raw === "0") return false;
    if (raw === "1") return true;
  } catch {
    /* ignore */
  }
  return true;
}

function readControlsMinimized(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(CONTROLS_MINIMIZED_KEY);
    if (raw === "0") return false;
    if (raw === "1") return true;
  } catch {
    /* ignore */
  }
  return true;
}

function readMasterOpen(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "0") return false;
    if (raw === "1") return true;
    // Only auto-open panels when explicitly requested (?studio=1).
    const params = new URLSearchParams(window.location.search);
    if (params.get("studio") === "1") return true;
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
  const [controlsMinimized, setControlsMinimizedState] = useState(readControlsMinimized);
  const [tabRailHidden, setTabRailHiddenState] = useState(readTabRailHidden);
  const [guidesVisible, setGuidesVisibleState] = useState(loadSiteGuidesVisible);
  const [studioPanels, setStudioPanels] = useState<StudioPanelEntry[]>([]);
  const [activePanelId, setActivePanelId] = useState<string | null>(null);
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

  const closeStudioPanel = useCallback(() => {
    setActivePanelId(null);
  }, []);

  const dockAllPanels = useCallback(() => {
    closeStudioPanel();
  }, [closeStudioPanel]);

  const openStudioPanel = useCallback(
    (panelId: string) => {
      if (!panelsRef.current.has(panelId)) return;
      applyMasterOpen(true);
      setActivePanelId(panelId);
    },
    [applyMasterOpen],
  );

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

  const setControlsMinimized = useCallback((minimized: boolean) => {
    setControlsMinimizedState(minimized);
    try {
      localStorage.setItem(CONTROLS_MINIMIZED_KEY, minimized ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleControlsMinimized = useCallback(() => {
    setControlsMinimizedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(CONTROLS_MINIMIZED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const setTabRailHidden = useCallback((hidden: boolean) => {
    setTabRailHiddenState(hidden);
    try {
      localStorage.setItem(TAB_RAIL_HIDDEN_KEY, hidden ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTabRailHidden = useCallback(() => {
    setTabRailHiddenState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(TAB_RAIL_HIDDEN_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
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
      activePanelId,
      openStudioPanel,
      closeStudioPanel,
      controlsMinimized,
      setControlsMinimized,
      toggleControlsMinimized,
      tabRailHidden,
      setTabRailHidden,
      toggleTabRailHidden,
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
      activePanelId,
      openStudioPanel,
      closeStudioPanel,
      controlsMinimized,
      setControlsMinimized,
      toggleControlsMinimized,
      tabRailHidden,
      setTabRailHidden,
      toggleTabRailHidden,
    ],
  );

  return (
    <LayoutStudioContext.Provider value={value}>
      {children}
      {enabled ? (
        <LayoutStudioControls
          panels={studioPanels}
          masterOpen={masterOpen}
          setMasterOpen={setMasterOpen}
          activePanelId={activePanelId}
        />
      ) : null}
    </LayoutStudioContext.Provider>
  );
}

const RECORD_STUDIO_PHASE_LINKS = [
  { label: "Sign-in", search: "recordShell=signin" },
  { label: "Prepare", search: "recordShell=station&recordPhase=prepare" },
  { label: "Upload", search: "recordShell=station&recordPhase=upload" },
  { label: "Seal", search: "recordShell=station&recordPhase=seal" },
] as const;

function LayoutStudioControls({
  panels,
  masterOpen,
  setMasterOpen,
  activePanelId,
}: {
  panels: StudioPanelEntry[];
  masterOpen: boolean;
  setMasterOpen: (open: boolean) => void;
  activePanelId: string | null;
}) {
  const location = useLocation();
  const {
    toggleMaster,
    dockAllPanels,
    openStudioPanel,
    guidesVisible,
    toggleGuides,
    controlsMinimized,
    setControlsMinimized,
    tabRailHidden,
    setTabRailHidden,
    toggleTabRailHidden,
  } = useLayoutStudio();
  const showRecordPhases =
    isLegacyStudioPreview() && location.pathname.startsWith("/legacy/record");

  const ensureMasterOpen = useCallback(() => {
    if (!masterOpen) setMasterOpen(true);
  }, [masterOpen, setMasterOpen]);

  const dockPos =
    typeof window !== "undefined"
      ? studioControlsDockPosition(activePanelId)
      : { x: 16, y: 16 };

  const studioParams = useCallback(() => {
    const params = new URLSearchParams(location.search);
    params.set("studio", "1");
    return params;
  }, [location.search]);

  if (controlsMinimized) {
    const minimized = (
      <button
        type="button"
        className="fixed left-0 top-1/2 z-[10060] -translate-y-1/2 rounded-r-md border border-l-0 border-[#E6A817]/40 bg-black/90 px-2 py-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#f5c518] shadow-lg backdrop-blur-sm hover:bg-black"
        data-beiza-layout-studio-controls
        onClick={() => setControlsMinimized(false)}
        title="Show layout studio controls"
        aria-label="Show layout studio controls"
      >
        <span className="[writing-mode:vertical-rl] rotate-180">Studio</span>
      </button>
    );
    if (typeof document === "undefined") return minimized;
    return createPortal(minimized, document.body);
  }

  const controls = (
    <div
      className="fixed z-[10060] flex max-w-[min(100vw-2rem,20rem)] flex-col items-start gap-2"
      data-beiza-layout-studio-controls
      style={{ left: dockPos.x, top: dockPos.y }}
      title="Layout studio — open panels here, then drag panel headers to your second screen"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <p className="rounded-md border border-[#E6A817]/40 bg-black/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#f5c518] shadow-lg">
          Studio controls
        </p>
        <button
          type="button"
          onClick={() => setControlsMinimized(true)}
          className="shrink-0 rounded-md border border-white/15 bg-black/90 px-2 py-1 text-[9px] font-medium text-white/60 hover:text-white"
          title="Hide studio dock (see page only)"
          aria-label="Hide studio controls"
        >
          Hide
        </button>
      </div>
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
                      dockAllPanels();
                      return;
                    }
                    ensureMasterOpen();
                    openStudioPanel(panel.id);
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

      {showRecordPhases ? (
        <div className="flex w-full flex-wrap items-center gap-1 rounded-lg border border-white/15 bg-black/90 p-2 shadow-lg backdrop-blur-sm">
          <span className="w-full px-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/50">
            Record flow
          </span>
          {RECORD_STUDIO_PHASE_LINKS.map((item) => {
            const params = studioParams();
            for (const part of item.search.split("&")) {
              const [key, value] = part.split("=");
              if (key) params.set(key, value ?? "");
            }
            return (
              <Link
                key={item.search}
                to={{ pathname: location.pathname, search: `?${params.toString()}` }}
                className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white hover:bg-primary/30 hover:text-primary"
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleTabRailHidden();
          }}
          className={cn(
            "rounded-full px-3 py-2 text-[11px] font-semibold tracking-wide shadow-lg transition",
            tabRailHidden
              ? "border border-white/20 bg-black/80 text-white/55 hover:text-white/80"
              : "bg-white/15 text-white ring-2 ring-white/40 ring-offset-2 ring-offset-black",
          )}
          aria-pressed={!tabRailHidden}
          aria-label={tabRailHidden ? "Show legacy tab rail" : "Hide legacy tab rail"}
          title="Home · Tree · Record · Vault rail on the right"
        >
          Tab rail
        </button>
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
      activePanelId: null,
      openStudioPanel: () => {},
      closeStudioPanel: () => {},
      controlsMinimized: true,
      setControlsMinimized: () => {},
      toggleControlsMinimized: () => {},
      tabRailHidden: true,
      setTabRailHidden: () => {},
      toggleTabRailHidden: () => {},
    }
  );
}
