import { useCallback } from "react";
import type { Location } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  useRecordLayoutStudio,
  type RecordLayoutStudioTarget,
} from "@/context/RecordLayoutStudioContext";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";

/** Preserve studio query string when switching Legacy tabs. */
export function legacyTabLinkTo(href: string, location: Pick<Location, "search" | "hash">) {
  const hashIndex = href.indexOf("#");
  if (hashIndex >= 0) {
    return {
      pathname: href.slice(0, hashIndex) || "/",
      search: location.search,
      hash: href.slice(hashIndex),
    };
  }
  return { pathname: href, search: location.search, hash: location.hash };
}

/**
 * Legacy tab rail / bar click handler — shift+click selects studio target;
 * same-route clicks noop. Normal clicks use React Router <Link> navigation.
 */
export function useLegacyTabNavigate() {
  const location = useLocation();
  const studioOn = isLayoutStudioEnabled();
  const studioCtx = useRecordLayoutStudio();

  return useCallback(
    (href: string, e: React.MouseEvent, studioTarget?: RecordLayoutStudioTarget) => {
      const target = studioTarget ?? (`nav-tab:${href}` as RecordLayoutStudioTarget);

      if (studioOn && e.shiftKey && studioCtx) {
        e.preventDefault();
        e.stopPropagation();
        studioCtx.selectTarget(target);
        return;
      }

      if (location.pathname === href || location.pathname === href.replace(/\/$/, "")) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    },
    [location.pathname, studioCtx, studioOn],
  );
}
