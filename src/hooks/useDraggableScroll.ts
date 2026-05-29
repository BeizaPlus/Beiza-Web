import { useEffect, useRef } from "react";

/** px/ms — cap so a hard fling does not overshoot endlessly */
const MAX_SCROLL_VELOCITY = 2.2;
/** Below this, skip coasting and only snap to the nearest card */
const MIN_SCROLL_VELOCITY = 0.12;
/** Velocity halves roughly every this many ms (time-based decay) */
const HALF_LIFE_MS = 220;
/** Movement before we treat pointer as drag (not click) */
const DRAG_THRESHOLD_PX = 8;

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function snapScrollToNearestChild(el: HTMLElement, behavior: ScrollBehavior) {
  const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
  if (maxScroll <= 0) return;

  let bestLeft = el.scrollLeft;
  let bestDist = Infinity;

  for (let i = 0; i < el.children.length; i++) {
    const c = el.children[i] as HTMLElement;
    if (!(c instanceof HTMLElement)) continue;
    const rect = c.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;

    const snapLeft = c.offsetLeft;
    const d = Math.abs(snapLeft - el.scrollLeft);
    if (d < bestDist) {
      bestDist = d;
      bestLeft = snapLeft;
    }
  }

  const target = clamp(bestLeft, 0, maxScroll);
  if (Math.abs(target - el.scrollLeft) < 0.5) return;
  el.scrollTo({ left: target, behavior });
}

function isDragExcludedTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest("a, input, select, textarea, label, [data-reel-play]"),
  );
}

export function useDraggableScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let pointerId: number | null = null;
    let startClientX = 0;
    let scrollLeftAtDown = 0;
    let didDrag = false;

    let prevMoveT = 0;
    let prevMoveX = 0;
    let releaseVelocity = 0;

    let momentumRaf = 0;
    let lastMomentumT = 0;

    const cancelMomentum = () => {
      if (momentumRaf) {
        cancelAnimationFrame(momentumRaf);
        momentumRaf = 0;
      }
    };

    const clearPointer = () => {
      pointerId = null;
      didDrag = false;
      el.classList.remove("is-dragging");
    };

    const finishWithSnap = (smooth: boolean) => {
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      snapScrollToNearestChild(el, prefersReduced ? "auto" : smooth ? "smooth" : "auto");
    };

    const runMomentum = (initialVelocity: number) => {
      cancelMomentum();
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReduced || Math.abs(initialVelocity) < MIN_SCROLL_VELOCITY) {
        finishWithSnap(true);
        return;
      }

      let v = clamp(initialVelocity, -MAX_SCROLL_VELOCITY, MAX_SCROLL_VELOCITY);
      lastMomentumT = performance.now();

      const step = (now: number) => {
        const dt = clamp(now - lastMomentumT, 0, 32);
        lastMomentumT = now;

        const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
        let next = el.scrollLeft + v * dt;

        if (next <= 0 && v < 0) {
          next = 0;
          v = 0;
        } else if (next >= maxScroll && v > 0) {
          next = maxScroll;
          v = 0;
        }

        el.scrollLeft = next;

        const decay = Math.pow(0.5, dt / HALF_LIFE_MS);
        v *= decay;

        if (Math.abs(v) < MIN_SCROLL_VELOCITY * 0.35) {
          momentumRaf = 0;
          finishWithSnap(true);
          return;
        }

        momentumRaf = requestAnimationFrame(step);
      };

      momentumRaf = requestAnimationFrame(step);
    };

    const suppressClickOnce = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (pointerId === null || e.pointerId !== pointerId) return;

      const deltaX = e.clientX - startClientX;
      if (!didDrag && Math.abs(deltaX) < DRAG_THRESHOLD_PX) return;

      if (!didDrag) {
        didDrag = true;
        el.classList.add("is-dragging");
        el.addEventListener("click", suppressClickOnce, { capture: true, once: true });
      }

      e.preventDefault();

      const t = performance.now();
      el.scrollLeft = scrollLeftAtDown - deltaX * 1.5;

      if (prevMoveT > 0) {
        const dt = t - prevMoveT;
        if (dt > 0 && dt < 80) {
          const screenDelta = e.clientX - prevMoveX;
          const instant = (-screenDelta / dt) * 1.5;
          releaseVelocity = releaseVelocity * 0.35 + instant * 0.65;
        }
      }
      prevMoveT = t;
      prevMoveX = e.clientX;
    };

    const onPointerEnd = (e: PointerEvent) => {
      if (pointerId === null || e.pointerId !== pointerId) return;

      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }

      const wasDrag = didDrag;
      clearPointer();

      if (wasDrag) {
        runMomentum(releaseVelocity);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      if (isDragExcludedTarget(e.target)) return;

      cancelMomentum();
      pointerId = e.pointerId;
      startClientX = e.clientX;
      scrollLeftAtDown = el.scrollLeft;
      didDrag = false;
      prevMoveT = performance.now();
      prevMoveX = e.clientX;
      releaseVelocity = 0;

      el.setPointerCapture(e.pointerId);
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerEnd);
    el.addEventListener("pointercancel", onPointerEnd);

    return () => {
      cancelMomentum();
      clearPointer();
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerEnd);
      el.removeEventListener("pointercancel", onPointerEnd);
    };
  }, []);

  return ref;
}
