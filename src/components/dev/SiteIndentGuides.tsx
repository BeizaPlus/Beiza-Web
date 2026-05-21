import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  siteContentIndentPx,
  sitePaddingPx,
  type SitePaddingFrame,
} from "@/lib/sitePaddingStudio";

type Props = {
  frame: SitePaddingFrame;
  /** Preview position when guides are measure-only */
  draftIndentRem: number;
  /** true = drag updates live copy; false = measure only until Apply */
  live: boolean;
  onDraftIndentChange: (rem: number) => void;
  onApplyIndent: () => void;
  visible: boolean;
};

function indentRemFromPointer(clientX: number, side: "left" | "right", boundaryPx: number): number {
  const maxIndentPx = Math.max(0, window.innerWidth / 2 - boundaryPx - 24);
  let nextIndentPx =
    side === "left" ? clientX - boundaryPx : window.innerWidth - clientX - boundaryPx;
  nextIndentPx = Math.min(maxIndentPx, Math.max(0, nextIndentPx));
  return Math.round((nextIndentPx / 16) * 100) / 100;
}

/** Draggable inner indent guides (inside the yellow boundary lines). */
export function SiteIndentGuides({
  frame,
  draftIndentRem,
  live,
  onDraftIndentChange,
  onApplyIndent,
  visible,
}: Props) {
  const boundaryPx = sitePaddingPx(frame);
  const appliedRem = frame.contentIndentRem;
  const displayRem = live ? appliedRem : draftIndentRem;
  const [dragging, setDragging] = useState(false);
  const dragSide = useRef<"left" | "right">("left");

  useEffect(() => {
    if (!live) onDraftIndentChange(appliedRem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedRem, live]);

  const displayPx = siteContentIndentPx({ ...frame, contentIndentRem: displayRem });
  const leftGuidePx = boundaryPx + displayPx;
  const rightGuidePx = boundaryPx + displayPx;
  const dirty = !live && Math.abs(draftIndentRem - appliedRem) > 0.01;

  const setIndentFromPointer = useCallback(
    (clientX: number, side: "left" | "right") => {
      onDraftIndentChange(indentRemFromPointer(clientX, side, boundaryPx));
    },
    [boundaryPx, onDraftIndentChange],
  );

  const onPointerDown = (side: "left" | "right") => (e: React.PointerEvent) => {
    e.preventDefault();
    dragSide.current = side;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setIndentFromPointer(e.clientX, dragSide.current);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setDragging(false);
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
        aria-label={live ? "Drag indent guide (live)" : "Drag indent guide (measure only)"}
        className={cn(
          "fixed z-[9999] h-14 w-3 -translate-x-1/2 cursor-ew-resize rounded-full",
          "border border-cyan-400/80 bg-cyan-400/25 hover:bg-cyan-400/40",
          !live && "ring-1 ring-cyan-300/50",
        )}
        style={{ left: leftGuidePx, top: "42%" }}
        onPointerDown={onPointerDown("left")}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      <button
        type="button"
        aria-label={live ? "Drag indent guide (live)" : "Drag indent guide (measure only)"}
        className={cn(
          "fixed z-[9999] h-14 w-3 translate-x-1/2 cursor-ew-resize rounded-full",
          "border border-cyan-400/80 bg-cyan-400/25 hover:bg-cyan-400/40",
          !live && "ring-1 ring-cyan-300/50",
        )}
        style={{ right: rightGuidePx, top: "42%" }}
        onPointerDown={onPointerDown("right")}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />

      <div className="pointer-events-auto fixed left-1/2 top-2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-1.5">
        <div className="rounded-md bg-black/90 px-3 py-1.5 font-mono text-[10px] text-cyan-200">
          {live ? "Live" : "Measure"}: {displayRem}rem ({displayPx * 2}px total)
          {!live && dirty ? " · not applied" : !live ? " · matches page" : ""}
        </div>
        {!live && dirty ? (
          <button
            type="button"
            onClick={onApplyIndent}
            className="rounded-full bg-cyan-500/90 px-3 py-1 text-[10px] font-semibold text-black hover:bg-cyan-400"
          >
            Apply indent to site
          </button>
        ) : null}
        <p className="max-w-[300px] text-center text-[9px] text-white/50">
          {live
            ? "Cyan lines push copy as you drag."
            : "Cyan lines are rulers only — page copy moves when you Apply or switch to Live push."}
        </p>
      </div>
    </>
  );
}
