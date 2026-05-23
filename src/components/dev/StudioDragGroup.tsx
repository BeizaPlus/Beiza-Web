import { useRef, type CSSProperties, type ReactNode } from "react";
import {
  useRecordLayoutStudio,
  type RecordLayoutStudioTarget,
} from "@/context/RecordLayoutStudioContext";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import {
  clampCopyOffsetFields,
  copyOffsetStyle,
  type CopyOffsetFields,
} from "@/lib/copyLayoutOffset";
import { cn } from "@/lib/utils";

const DRAG_CLICK_THRESHOLD_PX = 4;

type Props = {
  target: RecordLayoutStudioTarget;
  label: string;
  offset: CopyOffsetFields;
  onOffsetChange: (partial: Partial<CopyOffsetFields>) => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Studio-only draggable wrapper — moves children as one group (vw / vh). */
export function StudioDragGroup({
  target,
  label,
  offset,
  onOffsetChange,
  children,
  className,
  style,
}: Props) {
  const studioOn = isLayoutStudioEnabled();
  const ctx = useRecordLayoutStudio();
  const selected = studioOn && ctx?.activeTarget === target;
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  if (!studioOn) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const isInteractiveTarget = (el: EventTarget | null) =>
    el instanceof HTMLElement &&
    Boolean(el.closest("button, input, textarea, a, select, [role='slider'], audio, video"));

  const endDrag = (el: HTMLElement, pointerId: number) => {
    try {
      el.releasePointerCapture(pointerId);
    } catch {
      /* already released */
    }
    dragRef.current = null;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Drag to reposition: ${label}`}
      className={cn(
        "relative touch-none rounded-lg transition-shadow",
        selected
          ? "cursor-grab ring-2 ring-primary ring-offset-2 ring-offset-black/40 active:cursor-grabbing"
          : "cursor-grab ring-1 ring-white/20 hover:ring-primary/60 active:cursor-grabbing",
        className,
      )}
      style={{ ...copyOffsetStyle(offset), ...style }}
      onPointerDown={(e) => {
        if (!ctx || e.button !== 0 || isInteractiveTarget(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
        ctx.selectTarget(target);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        dragRef.current = {
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          originX: offset.offsetX,
          originY: offset.offsetY,
          moved: false,
        };
      }}
      onPointerMove={(e) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== e.pointerId) return;
        const dxPx = e.clientX - drag.startX;
        const dyPx = e.clientY - drag.startY;
        if (
          !drag.moved &&
          Math.hypot(dxPx, dyPx) >= DRAG_CLICK_THRESHOLD_PX
        ) {
          drag.moved = true;
        }
        if (!drag.moved) return;
        const dxVw = (dxPx / window.innerWidth) * 100;
        const dyVh = (dyPx / window.innerHeight) * 100;
        onOffsetChange(
          clampCopyOffsetFields({
            ...offset,
            offsetX: drag.originX + dxVw,
            offsetY: drag.originY + dyVh,
          }),
        );
      }}
      onPointerUp={(e) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== e.pointerId) return;
        if (!drag.moved) {
          ctx?.selectTarget(target);
        }
        endDrag(e.currentTarget as HTMLElement, e.pointerId);
      }}
      onPointerCancel={(e) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== e.pointerId) return;
        endDrag(e.currentTarget as HTMLElement, e.pointerId);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          ctx?.selectTarget(target);
        }
      }}
    >
      {selected ? (
        <span className="pointer-events-none absolute -top-5 left-0 z-10 rounded bg-primary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary-foreground">
          {label} · drag
        </span>
      ) : null}
      {children}
    </div>
  );
}
