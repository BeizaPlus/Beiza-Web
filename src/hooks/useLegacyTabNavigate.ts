import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useRecordLayoutStudio,
  type RecordLayoutStudioTarget,
} from "@/context/RecordLayoutStudioContext";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";

/**
 * Legacy tab rail / bar — always navigates to the wired /legacy/* route.
 * Shift+click (studio only) selects a tab icon for layout sliders instead.
 */
export function useLegacyTabNavigate() {
  const navigate = useNavigate();
  const location = useLocation();
  const studioOn = isLayoutStudioEnabled();
  const studioCtx = useRecordLayoutStudio();

  return useCallback(
    (href: string, e: React.MouseEvent, studioTarget?: RecordLayoutStudioTarget) => {
      const target = studioTarget ?? (`nav-tab:${href}` as RecordLayoutStudioTarget);

      if (studioOn && e.shiftKey && studioCtx) {
        e.preventDefault();
        e.stopPropagation();
        studioCtx.setActiveTarget(target);
        return;
      }

      if (location.pathname === href) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      navigate({ pathname: href, search: location.search, hash: location.hash });
    },
    [location.hash, location.pathname, location.search, navigate, studioCtx, studioOn],
  );
}
