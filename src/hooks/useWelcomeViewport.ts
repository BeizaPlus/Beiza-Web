import { useEffect, useState } from "react";
import {
  FRAMER_LAYOUT_BREAKPOINTS,
  layoutBreakpointFromWidth,
  type LayoutStudioBreakpoint,
} from "@/lib/layoutBreakpoints";

/** Welcome uses Framer tiers — same as site padding / record studio */
export function useWelcomeLayoutBreakpoint(): LayoutStudioBreakpoint {
  const [breakpoint, setBreakpoint] = useState<LayoutStudioBreakpoint>(() =>
    typeof window !== "undefined" ? layoutBreakpointFromWidth(window.innerWidth) : "desktop",
  );

  useEffect(() => {
    const update = () => setBreakpoint(layoutBreakpointFromWidth(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return breakpoint;
}

/** Phone only (≤809px) — bottom locale bar + stacked cards */
export function useWelcomePhoneLayout(): boolean {
  const bp = useWelcomeLayoutBreakpoint();
  return bp === "phone";
}

/** Phone or tablet — not desktop 3-up grid */
export function useWelcomeCompactLayout(): boolean {
  const bp = useWelcomeLayoutBreakpoint();
  return bp === "phone" || bp === "tablet";
}

/** @deprecated use useWelcomePhoneLayout */
export function useWelcomeMobileLayout(): boolean {
  return useWelcomePhoneLayout();
}

export const WELCOME_PHONE_MQ = `(max-width: ${FRAMER_LAYOUT_BREAKPOINTS.phoneMaxPx}px)`;
