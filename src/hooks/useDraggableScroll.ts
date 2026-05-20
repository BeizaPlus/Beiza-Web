import { useEffect, useRef } from "react";

/** px/ms — cap so a hard fling does not overshoot endlessly */
const MAX_SCROLL_VELOCITY = 2.2;
/** Below this, skip coasting and only snap to the nearest card */
const MIN_SCROLL_VELOCITY = 0.12;
/** Velocity halves roughly every this many ms (time-based decay) */
const HALF_LIFE_MS = 220;

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

export function useDraggableScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeftAtDown = 0;

    let prevMoveT = 0;
    let prevMoveX = 0;
    /** Signed scroll velocity (px/ms): positive = scrolling content to the right */
    let releaseVelocity = 0;

    let momentumRaf = 0;
    let lastMomentumT = 0;

    const cancelMomentum = () => {
      if (momentumRaf) {
        cancelAnimationFrame(momentumRaf);
        momentumRaf = 0;
      }
    };

    const endDragSurface = () => {
      isDown = false;
      el.classList.remove("is-dragging");
      document.removeEventListener("mousemove", onDocumentMouseMove);
      document.removeEventListener("mouseup", onDocumentMouseUp);
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

    const onDocumentMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();

      const t = performance.now();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeftAtDown - walk;

      if (prevMoveT > 0) {
        const dt = t - prevMoveT;
        if (dt > 0 && dt < 80) {
          const screenDelta = e.pageX - prevMoveX;
          const instant = (-screenDelta / dt) * 1.5;
          releaseVelocity = releaseVelocity * 0.35 + instant * 0.65;
        }
      }
      prevMoveT = t;
      prevMoveX = e.pageX;
    };

    const onDocumentMouseUp = () => {
      if (!isDown) return;
      endDragSurface();
      runMomentum(releaseVelocity);
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      cancelMomentum();

      isDown = true;
      el.classList.add("is-dragging");
      startX = e.pageX - el.offsetLeft;
      scrollLeftAtDown = el.scrollLeft;
      prevMoveT = performance.now();
      prevMoveX = e.pageX;
      releaseVelocity = 0;

      document.addEventListener("mousemove", onDocumentMouseMove);
      document.addEventListener("mouseup", onDocumentMouseUp);
    };

    el.addEventListener("mousedown", onMouseDown);

    return () => {
      cancelMomentum();
      endDragSurface();
      el.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onDocumentMouseMove);
      document.removeEventListener("mouseup", onDocumentMouseUp);
    };
  }, []);

  return ref;
}
