import { useCallback, useEffect, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { GripVertical } from "lucide-react";
import { useLayoutStudio } from "@/context/LayoutStudioContext";
import {
  clampStudioPanelPosition,
  loadStudioPanelSharedPosition,
  saveStudioPanelSharedPosition,
  studioPanelDefaultPosition,
} from "@/lib/studioPanelPlacement";

const PANEL_W = 352;
const PANEL_MIN_TOP = 48;

function panelReopenStackOffset(panelId: string): number {
  let hash = 0;
  for (let i = 0; i < panelId.length; i++) {
    hash = (hash + panelId.charCodeAt(i) * (i + 3)) % 7;
  }
  return hash * 36;
}

type Props = {
  panelId: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  children: ReactNode;
  openButtonLabel?: string;
};

export function FloatingStudioShell({
  panelId,
  open,
  onOpen,
  onClose,
  children,
  openButtonLabel = "Panel",
}: Props) {
  const { enabled: masterMode, masterOpen, activePanelId, registerStudioPanel, unregisterStudioPanel } =
    useLayoutStudio();
  const [pos, setPos] = useState(() => loadStudioPanelSharedPosition() ?? studioPanelDefaultPosition());
  const posRef = useRef(pos);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  );

  posRef.current = pos;

  useEffect(() => {
    const saved = loadStudioPanelSharedPosition();
    if (saved) setPos(saved);
    else setPos(studioPanelDefaultPosition());
  }, []);

  const persistPos = useCallback((next: { x: number; y: number }) => {
    setPos(next);
    saveStudioPanelSharedPosition(next);
  }, []);

  useEffect(() => {
    if (!masterMode) return;
    registerStudioPanel({ id: panelId, label: openButtonLabel, open, onOpen, onClose });
    return () => unregisterStudioPanel(panelId);
  }, [
    masterMode,
    panelId,
    openButtonLabel,
    open,
    onOpen,
    onClose,
    registerStudioPanel,
    unregisterStudioPanel,
  ]);

  const onWindowPointerMoveRef = useRef<(e: PointerEvent) => void>(() => {});
  const endDragRef = useRef(() => {});

  onWindowPointerMoveRef.current = (e: PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    persistPos(clampStudioPanelPosition(dragRef.current.originX + dx, dragRef.current.originY + dy));
  };

  endDragRef.current = () => {
    dragRef.current = null;
    window.removeEventListener("pointermove", onWindowPointerMoveRef.current);
    window.removeEventListener("pointerup", endDragRef.current);
    window.removeEventListener("pointercancel", endDragRef.current);
  };

  const onDragStart = (e: ReactPointerEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: posRef.current.x,
      originY: posRef.current.y,
    };
    window.addEventListener("pointermove", onWindowPointerMoveRef.current);
    window.addEventListener("pointerup", endDragRef.current);
    window.addEventListener("pointercancel", endDragRef.current);
  };

  useEffect(() => () => endDragRef.current(), []);

  if (!masterMode) return null;

  const panelVisible = masterOpen && open && activePanelId === panelId;

  if (!panelVisible) {
    const stack = panelReopenStackOffset(panelId);
    const chipPos = clampStudioPanelPosition(pos.x, Math.max(PANEL_MIN_TOP, pos.y - 44 - stack));

    const reopen = (
      <button
        type="button"
        data-beiza-studio-panel-reopen
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        className="pointer-events-auto fixed z-[10055] max-w-[min(100vw-2rem,14rem)] truncate rounded-full border border-[#E6A817]/55 bg-black/92 px-3 py-2 text-left text-[11px] font-semibold text-[#f5c518] shadow-lg ring-1 ring-[#f5c518]/25 backdrop-blur-sm hover:bg-[#E6A817]/20"
        style={{ left: chipPos.x, top: chipPos.y }}
        title={`Open ${openButtonLabel}`}
      >
        {openButtonLabel}
      </button>
    );

    if (typeof document === "undefined") return reopen;
    return createPortal(reopen, document.body);
  }

  const panel = (
    <aside
      data-beiza-studio-panel
      className="pointer-events-auto fixed z-[10050] w-[min(100vw-2rem,22rem)] max-h-[min(85vh,calc(100vh-2rem))] overflow-y-auto rounded-xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-md"
      style={{ left: pos.x, top: pos.y, width: PANEL_W }}
    >
      <div
        className="mb-3 flex cursor-grab touch-none select-none items-center justify-between gap-2 active:cursor-grabbing"
        onPointerDown={onDragStart}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {openButtonLabel} · drag to move
          </p>
        </div>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="shrink-0 rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-white/10 hover:text-foreground"
        >
          Hide
        </button>
      </div>
      <p className="mb-3 text-[9px] text-muted-foreground/80">
        One panel at a time — click another region to switch. Drag the header to your second screen.
      </p>
      {children}
    </aside>
  );

  if (typeof document === "undefined") return panel;
  return createPortal(panel, document.body);
}
