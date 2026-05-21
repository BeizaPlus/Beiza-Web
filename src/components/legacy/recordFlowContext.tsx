import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

const defaultSnapshot: RecordFlowSnapshot = {
  phase: "prepare",
  isRequestingMic: false,
  elapsedSeconds: 0,
  promptText: "",
};

const RecordFlowContext = createContext<RecordFlowContextValue | null>(null);

export function RecordFlowProvider({ children }: { children: ReactNode }) {
  const bridgeRef = useRef<RecordFlowBridge | null>(null);
  const [snapshot, setSnapshot] = useState<RecordFlowSnapshot>(defaultSnapshot);

  const syncSnapshot = useCallback(() => {
    if (bridgeRef.current) setSnapshot(bridgeRef.current.getSnapshot());
  }, []);

  const registerBridge = useCallback(
    (bridge: RecordFlowBridge | null) => {
      bridgeRef.current = bridge;
      if (bridge) setSnapshot(bridge.getSnapshot());
      else setSnapshot(defaultSnapshot);
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
