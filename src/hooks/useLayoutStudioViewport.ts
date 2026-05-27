import { useEffect, useState } from "react";
import {
  FRAMER_LAYOUT_BREAKPOINTS,
  layoutBreakpointFromWidth,
  layoutBreakpointLabel,
  type LayoutStudioBreakpoint,
} from "@/lib/layoutBreakpoints";

export type { LayoutStudioBreakpoint };

export { layoutBreakpointLabel, FRAMER_LAYOUT_BREAKPOINTS };

/** Active Framer tier for layout studio panels + guides */
export function useLayoutStudioBreakpoint(): LayoutStudioBreakpoint {
  const [breakpoint, setBreakpoint] = useState<LayoutStudioBreakpoint>(() =>
    typeof window !== "undefined"
      ? layoutBreakpointFromWidth(window.innerWidth)
      : "desktop",
  );

  useEffect(() => {
    const update = () => setBreakpoint(layoutBreakpointFromWidth(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return breakpoint;
}

/** True only on phone tier (≤639px) — record/welcome compact layouts */
export function useLayoutStudioPhone(): boolean {
  const bp = useLayoutStudioBreakpoint();
  return bp === "phone";
}

/** @deprecated use useLayoutStudioPhone */
export function useLayoutStudioMobile(): boolean {
  return useLayoutStudioPhone();
}

export const LAYOUT_STUDIO_MOBILE_MQ = `(max-width: ${FRAMER_LAYOUT_BREAKPOINTS.phoneMaxPx}px)`;
