import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { studioRecordPhaseParam } from "@/lib/layoutStudio";
import { STUDIO_MOCK_PROMPT_TEXT } from "@/lib/legacy/studioPreviewData";
import type { RecordPhase } from "@/lib/legacy/types";

export type RecordFlowSnapshot = {
  phase: RecordPhase;
  isRequestingMic: boolean;
  elapsedSeconds: number;
  promptText: string;
};

type RecordFlowBridge = {
  getSnapshot: () => RecordFlowSnapshot;
  handleRecordTap: () => void;
};

type RecordFlowContextValue = {
  snapshot: RecordFlowSnapshot;
  requestStart: () => void;
  registerBridge: (bridge: RecordFlowBridge | null) => void;
  syncSnapshot: () => void;
};

function initialSnapshot(): RecordFlowSnapshot {
  const studioPhase = studioRecordPhaseParam();
  return {
    phase: studioPhase ?? "prepare",
    isRequestingMic: false,
    elapsedSeconds: studioPhase === "recording" ? 12 : 0,
    promptText: studioPhase ? STUDIO_MOCK_PROMPT_TEXT : "",
  };
}

const RecordFlowContext = createContext<RecordFlowContextValue | null>(null);

export function RecordFlowProvider({ children }: { children: ReactNode }) {
  const bridgeRef = useRef<RecordFlowBridge | null>(null);
  const [snapshot, setSnapshot] = useState<RecordFlowSnapshot>(initialSnapshot);

  const syncSnapshot = useCallback(() => {
    if (bridgeRef.current) setSnapshot(bridgeRef.current.getSnapshot());
  }, []);

  const registerBridge = useCallback(
    (bridge: RecordFlowBridge | null) => {
      bridgeRef.current = bridge;
      if (bridge) setSnapshot(bridge.getSnapshot());
      else setSnapshot(initialSnapshot());
    },
    [],
  );

  const requestStart = useCallback(() => {
    bridgeRef.current?.handleRecordTap();
    syncSnapshot();
  }, [syncSnapshot]);

  const value = useMemo(
    () => ({ snapshot, requestStart, registerBridge, syncSnapshot }),
    [snapshot, requestStart, registerBridge, syncSnapshot],
  );

  return <RecordFlowContext.Provider value={value}>{children}</RecordFlowContext.Provider>;
}

export function useRecordFlow() {
  const ctx = useContext(RecordFlowContext);
  if (!ctx) {
    throw new Error("useRecordFlow must be used within RecordFlowProvider");
  }
  return ctx;
}

/** Optional — hero CTA when provider not mounted */
export function useRecordFlowOptional() {
  return useContext(RecordFlowContext);
}
