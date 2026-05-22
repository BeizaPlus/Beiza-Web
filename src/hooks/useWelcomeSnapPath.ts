import { useEffect, useState, type RefObject } from "react";
import type { WelcomePathKey } from "@/lib/locale/types";
import { FRAMER_LAYOUT_BREAKPOINTS } from "@/lib/layoutBreakpoints";

/** Which welcome path card is snapped to the viewport center on phone (≤809px). */
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

    const pick = (entries: IntersectionObserverEntry[]) => {
      const visible = entries
        .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.45)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      const top = visible[0]?.target.getAttribute("data-welcome-path") as WelcomePathKey | null;
      if (top) setSnapped(top);
    };

    let io: IntersectionObserver | null = null;

    const attach = () => {
      io?.disconnect();
      if (!mq.matches) return;
      io = new IntersectionObserver(pick, { root, threshold: [0.45, 0.6, 0.75, 0.9] });
      nodes.forEach((n) => io!.observe(n));
    };

    attach();
    mq.addEventListener("change", attach);
    return () => {
      mq.removeEventListener("change", attach);
      io?.disconnect();
    };
  }, [scrollRef, paths]);

  return snapped;
}
