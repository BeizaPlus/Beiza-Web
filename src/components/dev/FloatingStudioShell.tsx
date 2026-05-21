import { useCallback, useEffect, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { GripVertical } from "lucide-react";
import { useLayoutStudio } from "@/context/LayoutStudioContext";

const STORAGE_PREFIX = "beiza-studio-panel-pos:";
const PANEL_W = 352;
const PANEL_MIN_TOP = 48;

/** Default panel anchor — right side, staggered vertically */
function defaultPanelPos(panelId: string): { x: number; y: number } {
  const w = typeof window !== "undefined" ? window.innerWidth : 1200;
  const x = Math.max(16, w - PANEL_W - 16);
  let hash = 0;
  for (let i = 0; i < panelId.length; i++) hash += panelId.charCodeAt(i);
  const y = PANEL_MIN_TOP + (hash % 5) * 48;
  return { x, y };
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
  const { enabled: masterMode, masterOpen, registerStudioPanel, unregisterStudioPanel } =
    useLayoutStudio();
  const [pos, setPos] = useState(() => defaultPanelPos(panelId));
  const posRef = useRef(pos);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  );

  posRef.current = pos;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${panelId}`);
      if (raw) {
        const parsed = JSON.parse(raw) as { x?: number; y?: number };
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          setPos({ x: parsed.x, y: parsed.y });
        }
      }
    } catch {
      /* ignore */
    }
  }, [panelId]);

  const persistPos = useCallback(
    (next: { x: number; y: number }) => {
      setPos(next);
      localStorage.setItem(`${STORAGE_PREFIX}${panelId}`, JSON.stringify(next));
    },
    [panelId],
  );

  const clampPos = useCallback((x: number, y: number) => {
    const maxY =
      typeof window !== "undefined"
        ? Math.max(PANEL_MIN_TOP, window.innerHeight - 120)
        : y;
    return {
      x: Math.max(8, Math.min((window.innerWidth ?? 1200) - PANEL_W - 8, x)),
      y: Math.max(PANEL_MIN_TOP, Math.min(maxY, y)),
    };
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
    persistPos(clampPos(dragRef.current.originX + dx, dragRef.current.originY + dy));
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

  if (masterMode && !masterOpen) return null;
  if (!open) return null;

  const panel = (
    <aside
      data-beiza-studio-panel
      className="pointer-events-auto fixed z-[10050] w-[min(100vw-2rem,22rem)] max-h-[min(85vh,calc(100vh-2rem))] overflow-y-auto rounded-xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-md"
      style={{ left: pos.x, top: pos.y }}
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
        Drag the header bar to move. Click numbers to type; double-click sliders to reset.
      </p>
      {children}
    </aside>
  );

  if (typeof document === "undefined") return panel;
  return createPortal(panel, document.body);
}
