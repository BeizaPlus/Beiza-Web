import { createContext, useContext, useState, type ReactNode } from "react";
import {
  loadRecordMemoryStudioFrame,
  type RecordMemoryStudioFrame,
} from "@/lib/legacy/recordMemoryStudio";
import {
  loadLegacyNavTabStudioFrame,
  type LegacyNavTabStudioFrame,
} from "@/lib/legacy/legacyNavTabStudio";

/** Click-to-edit targets on /legacy/record (studio mode). */
export type RecordLayoutStudioTarget =
  | "record-cta"
  | "record-playback"
  | "record-upload"
  | "record-seal"
  | "nav-rail"
  | `nav-tab:${string}`;

type RecordLayoutStudioContextValue = {
  activeTarget: RecordLayoutStudioTarget | null;
  setActiveTarget: (target: RecordLayoutStudioTarget | null) => void;
  memoryFrame: RecordMemoryStudioFrame;
  setMemoryFrame: (frame: RecordMemoryStudioFrame) => void;
  tabFrame: LegacyNavTabStudioFrame;
  setTabFrame: (frame: LegacyNavTabStudioFrame) => void;
};

const RecordLayoutStudioContext = createContext<RecordLayoutStudioContextValue | null>(
  null,
);

export function RecordLayoutStudioProvider({ children }: { children: ReactNode }) {
  const [activeTarget, setActiveTarget] = useState<RecordLayoutStudioTarget | null>(null);
  const [memoryFrame, setMemoryFrame] = useState(() => loadRecordMemoryStudioFrame());
  const [tabFrame, setTabFrame] = useState(() => loadLegacyNavTabStudioFrame());
  return (
    <RecordLayoutStudioContext.Provider
      value={{
        activeTarget,
        setActiveTarget,
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
