import { useEffect, useState, type RefObject } from "react";
import type { WelcomePathKey } from "@/lib/locale/types";
import { FRAMER_LAYOUT_BREAKPOINTS } from "@/lib/layoutBreakpoints";

/** Which welcome path card is foremost in the phone carousel (≤639px). */
export function useWelcomeSnapPath(
  scrollRef: RefObject<HTMLElement | null>,
  paths: readonly WelcomePathKey[],
): WelcomePathKey {
  const [snapped, setSnapped] = useState<WelcomePathKey>(paths[1] ?? "legacy");

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const mq = window.matchMedia(`(max-width: ${FRAMER_LAYOUT_BREAKPOINTS.phoneMaxPx}px)`);
    const nodes = paths
      .map((key) => root.querySelector<HTMLElement>(`[data-welcome-path="${key}"]`))
      .filter((n): n is HTMLElement => !!n);

    if (!nodes.length) return;

    const pickFromScroll = () => {
      if (!mq.matches) return;
      const rootRect = root.getBoundingClientRect();
      const focusX = rootRect.left + rootRect.width * 0.42;

      let bestKey: WelcomePathKey | null = null;
      let bestDist = Number.POSITIVE_INFINITY;

      for (const node of nodes) {
        const key = node.getAttribute("data-welcome-path") as WelcomePathKey | null;
        if (!key) continue;
        const rect = node.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        const dist = Math.abs(midX - focusX);
        if (dist < bestDist) {
          bestDist = dist;
          bestKey = key;
        }
      }

      if (bestKey) setSnapped(bestKey);
    };

    let io: IntersectionObserver | null = null;

    const disable = () => {
      io?.disconnect();
      io = null;
      root.removeEventListener("scroll", pickFromScroll);
      window.removeEventListener("resize", pickFromScroll);
    };

    const enable = () => {
      disable();
      if (!mq.matches) return;

      pickFromScroll();

      io = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          const top = visible[0]?.target.getAttribute("data-welcome-path") as WelcomePathKey | null;
          if (top) setSnapped(top);
        },
        { root, threshold: [0.55, 0.7, 0.85] },
      );
      nodes.forEach((n) => io!.observe(n));
      root.addEventListener("scroll", pickFromScroll, { passive: true });
      window.addEventListener("resize", pickFromScroll);
    };

    enable();
    mq.addEventListener("change", enable);

    return () => {
      mq.removeEventListener("change", enable);
      disable();
    };
  }, [scrollRef, paths]);

  return snapped;
}
