import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_PREFIX = "beiza-studio-panel-pos:";

const DEFAULT_POS = { x: 16, y: 88 };

type Props = {
  panelId: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  children: ReactNode;
  /** Offset the reopen chip when multiple studios are on one page */
  openButtonClassName?: string;
  openButtonLabel?: string;
};

export function FloatingStudioShell({
  panelId,
  open,
  onOpen,
  onClose,
  children,
  openButtonClassName,
  openButtonLabel = "Layout studio",
}: Props) {
  const [pos, setPos] = useState(DEFAULT_POS);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  );

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

  const onDragStart = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: pos.x, originY: pos.y };
  };

  const onDragMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const panelW = 352;
    const panelH = 120;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    persistPos({
      x: Math.max(8, Math.min(window.innerWidth - panelW, dragRef.current.originX + dx)),
      y: Math.max(8, Math.min(window.innerHeight - panelH, dragRef.current.originY + dy)),
    });
  };

  const onDragEnd = () => {
    dragRef.current = null;
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "fixed bottom-4 left-4 z-[200] rounded-full bg-[#E6A817] px-4 py-2 text-xs font-semibold text-[#0a0a0a] shadow-lg",
          openButtonClassName,
        )}
      >
        {openButtonLabel}
      </button>
    );
  }

  return (
    <aside
      className="fixed z-[200] w-[min(100vw-2rem,22rem)] max-h-[min(85vh,calc(100vh-2rem))] overflow-y-auto rounded-xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-md"
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        className="mb-3 flex cursor-grab select-none items-center justify-between gap-2 active:cursor-grabbing"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Layout studio (local) · drag to move
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
        >
          Hide
        </button>
      </div>
      <p className="mb-3 text-[9px] text-muted-foreground/80">
        Click the number to type a value. Double-click a slider to reset.
      </p>
      {children}
    </aside>
  );
}
