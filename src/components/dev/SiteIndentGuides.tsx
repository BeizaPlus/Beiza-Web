import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  siteContentIndentPx,
  sitePaddingPx,
  type SitePaddingFrame,
} from "@/lib/sitePaddingStudio";

type Props = {
  frame: SitePaddingFrame;
  onChange: (frame: SitePaddingFrame) => void;
  visible: boolean;
};

/** Draggable inner indent guides (inside the yellow boundary lines). */
export function SiteIndentGuides({ frame, onChange, visible }: Props) {
  const boundaryPx = sitePaddingPx(frame);
  const indentPx = siteContentIndentPx(frame);
  const leftGuidePx = boundaryPx + indentPx;
  const rightGuidePx = boundaryPx + indentPx;
  const dragRef = useRef<{ side: "left" | "right"; startX: number; startIndentRem: number } | null>(null);

  const setIndentFromPointer = useCallback(
    (clientX: number, side: "left" | "right") => {
      const maxIndentPx = Math.max(0, window.innerWidth / 2 - boundaryPx - 24);
      let nextIndentPx =
        side === "left" ? clientX - boundaryPx : window.innerWidth - clientX - boundaryPx;
      nextIndentPx = Math.min(maxIndentPx, Math.max(0, nextIndentPx));
      const nextRem = Math.round((nextIndentPx / 16) * 100) / 100;
      onChange({ ...frame, contentIndentRem: nextRem });
    },
    [boundaryPx, frame, onChange],
  );

  const onPointerDown = (side: "left" | "right") => (e: React.PointerEvent) => {
    e.preventDefault();
    dragRef.current = { side, startX: e.clientX, startIndentRem: frame.contentIndentRem };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setIndentFromPointer(e.clientX, dragRef.current.side);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  if (!visible) return null;

  const guideClass =
    "fixed top-0 bottom-0 z-[9997] w-px bg-cyan-400/70 pointer-events-none";

  return (
    <>
      <div className={guideClass} style={{ left: leftGuidePx }} aria-hidden />
      <div className={guideClass} style={{ right: rightGuidePx }} aria-hidden />

      <button
        type="button"
        aria-label="Drag left indent guide"
        className={cn(
          "fixed z-[9999] h-14 w-3 -translate-x-1/2 cursor-ew-resize rounded-full",
          "border border-cyan-400/80 bg-cyan-400/25 hover:bg-cyan-400/40",
        )}
        style={{ left: leftGuidePx, top: "42%" }}
        onPointerDown={onPointerDown("left")}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      <button
        type="button"
        aria-label="Drag right indent guide"
        className={cn(
          "fixed z-[9999] h-14 w-3 translate-x-1/2 cursor-ew-resize rounded-full",
          "border border-cyan-400/80 bg-cyan-400/25 hover:bg-cyan-400/40",
        )}
        style={{ right: rightGuidePx, top: "42%" }}
        onPointerDown={onPointerDown("right")}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />

      <div
        className="pointer-events-none fixed left-1/2 top-2 z-[9999] -translate-x-1/2 rounded-md bg-black/80 px-2 py-1 font-mono text-[9px] text-cyan-200"
        aria-live="polite"
      >
        Inner indent: {frame.contentIndentRem}rem ({indentPx * 2}px total)
      </div>
    </>
  );
}
