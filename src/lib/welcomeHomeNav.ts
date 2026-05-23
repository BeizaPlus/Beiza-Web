import type { MouseEvent } from "react";
import type { NavigateFunction } from "react-router-dom";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";

export const WELCOME_HOME_PATH = BEIZA_LINKS.welcome.gate;

/** Primary click on logo / mascot — SPA navigate; modifiers keep native <a> behavior. */
export function handleWelcomeHomeClick(
  e: MouseEvent<HTMLAnchorElement>,
  navigate: NavigateFunction,
  onAfter?: () => void,
) {
  if (e.defaultPrevented) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

  e.preventDefault();
  onAfter?.();
  navigate(WELCOME_HOME_PATH);
}
