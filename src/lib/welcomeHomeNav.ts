import type { MouseEvent } from "react";
import type { NavigateFunction } from "react-router-dom";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";

export const WELCOME_HOME_PATH = BEIZA_LINKS.welcome.gate;

/** Welcome gate listens for this to snap cards back to the start. */
export const WELCOME_HOME_RESET_EVENT = "beiza:welcome-home-reset";

function normalizePath(pathname: string): string {
  const path = pathname.split("?")[0]?.split("#")[0] ?? "/";
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

export function isWelcomeHomePath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return path === WELCOME_HOME_PATH || path === BEIZA_LINKS.welcome.root;
}

/** Scroll phone carousel back to the first path card. */
export function resetWelcomeGateView(): void {
  if (typeof window === "undefined") return;
  const row = document.querySelector(".welcome-cards-row");
  if (row instanceof HTMLElement) {
    row.scrollTo({ left: 0, behavior: "smooth" });
  }
  window.dispatchEvent(new CustomEvent(WELCOME_HOME_RESET_EVENT));
}

/** Primary click on logo / mascot — SPA navigate; modifiers keep native <a> behavior. */
export function handleWelcomeHomeClick(
  e: MouseEvent<HTMLAnchorElement>,
  navigate: NavigateFunction,
  onAfter?: () => void,
  currentPath?: string,
) {
  if (e.defaultPrevented) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

  const current = normalizePath(currentPath ?? window.location.pathname);

  if (isWelcomeHomePath(current)) {
    e.preventDefault();
    onAfter?.();
    resetWelcomeGateView();
    return;
  }

  e.preventDefault();
  onAfter?.();
  navigate(WELCOME_HOME_PATH);
}
