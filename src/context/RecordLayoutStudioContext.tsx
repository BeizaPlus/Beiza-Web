import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useLayoutStudio } from "@/context/LayoutStudioContext";
import {
  loadRecordMemoryStudioFrame,
  type RecordMemoryStudioFrame,
} from "@/lib/legacy/recordMemoryStudio";
import {
  loadLegacyNavTabStudioFrame,
  type LegacyNavTabStudioFrame,
} from "@/lib/legacy/legacyNavTabStudio";
import { studioPanelIdForTarget } from "@/lib/recordLayoutStudioPanels";

/** Click-to-edit targets on /legacy/record (studio mode). */
export type RecordLayoutStudioTarget =
  | "record-page"
  | "record-cta"
  | "record-playback"
  | "record-upload"
  | "record-upload-hud"
  | "record-seal"
  | "nav-rail"
  | `nav-tab:${string}`;

type RecordLayoutStudioContextValue = {
  activeTarget: RecordLayoutStudioTarget | null;
  setActiveTarget: (target: RecordLayoutStudioTarget | null) => void;
  /** Highlight target and open its PANELS dock control. */
  selectTarget: (target: RecordLayoutStudioTarget) => void;
  memoryFrame: RecordMemoryStudioFrame;
  setMemoryFrame: (frame: RecordMemoryStudioFrame) => void;
  tabFrame: LegacyNavTabStudioFrame;
  setTabFrame: (frame: LegacyNavTabStudioFrame) => void;
};

const RecordLayoutStudioContext = createContext<RecordLayoutStudioContextValue | null>(
  null,
);

export function RecordLayoutStudioProvider({ children }: { children: ReactNode }) {
  const { openStudioPanel } = useLayoutStudio();
  const [activeTarget, setActiveTarget] = useState<RecordLayoutStudioTarget | null>(null);
  const [memoryFrame, setMemoryFrame] = useState(() => loadRecordMemoryStudioFrame());
  const [tabFrame, setTabFrame] = useState(() => loadLegacyNavTabStudioFrame());

  const selectTarget = useCallback(
    (target: RecordLayoutStudioTarget) => {
      setActiveTarget(target);
      const panelId = studioPanelIdForTarget(target);
      if (panelId) openStudioPanel(panelId);
    },
    [openStudioPanel],
  );

  return (
    <RecordLayoutStudioContext.Provider
      value={{
        activeTarget,
        setActiveTarget,
        selectTarget,
        memoryFrame,
        setMemoryFrame,
        tabFrame,
        setTabFrame,
      }}
    >
      {children}
    </RecordLayoutStudioContext.Provider>
  );
}

export function useRecordLayoutStudio() {
  return useContext(RecordLayoutStudioContext);
}
