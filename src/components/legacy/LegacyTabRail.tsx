import { Link, useLocation } from "react-router-dom";
import { StudioSubsetZone } from "@/components/dev/StudioSubsetZone";
import { LegacyNavIcon } from "@/components/legacy/LegacyNavIcon";
import { LEGACY_TAB_ITEMS } from "@/components/legacy/LegacyTabBar";
import { LegacyNavStudio } from "@/components/legacy/LegacyNavStudio";
import { useRecordLayoutStudio } from "@/context/RecordLayoutStudioContext";
import { legacyTabLinkTo, useLegacyTabNavigate } from "@/hooks/useLegacyTabNavigate";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import { legacyNavTabOffsetStyle } from "@/lib/legacy/legacyNavTabStudio";
import { cn } from "@/lib/utils";

/**
 * Vertical Legacy nav (Home · Tree · Record · Vault · Invite) — overlays record station
 * and other /legacy/* pages. Each icon routes to its built page under App.tsx.
 */
export function LegacyTabRail() {
  const location = useLocation();
  const studioOn = isLayoutStudioEnabled();
  const studioCtx = useRecordLayoutStudio();
  const tabFrame = studioCtx?.tabFrame;
  const goToTab = useLegacyTabNavigate();

  return (
    <LegacyNavStudio
      recordOverlay
      className="legacy-record-tab-rail"
      studioSelectable={studioOn}
    >
      <nav
        className={cn(
          "items-center gap-1 rounded-full border border-white/10 bg-black/80 p-2 shadow-lg backdrop-blur-sm",
          "flex flex-row max-md:px-2.5 max-md:py-2",
          "md:flex-col",
        )}
        aria-label="Legacy"
      >
        {LEGACY_TAB_ITEMS.map((item) => {
          const active = item.end
            ? location.pathname === item.href
            : location.pathname.startsWith(item.href);
          const link = (
            <Link
              key={item.href}
              to={legacyTabLinkTo(item.href, location)}
              title={studioOn ? `${item.label} · Shift+click to adjust position` : item.label}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              onClick={(e) => goToTab(item.href, e)}
              className={cn(
                "flex items-center justify-center rounded-full transition-colors",
                "h-9 w-9 max-md:h-10 max-md:w-10 md:h-10 md:w-10",
                active
                  ? "bg-white text-black shadow-sm"
                  : "text-white/55 hover:bg-white/10 hover:text-white/90",
              )}
              style={tabFrame ? legacyNavTabOffsetStyle(tabFrame, item.href) : undefined}
            >
              <LegacyNavIcon name={item.icon} active={active} className="h-5 w-5" />
            </Link>
          );
          if (!studioOn) return link;
          return (
            <StudioSubsetZone
              key={item.href}
              target={`nav-tab:${item.href}`}
              label={item.label}
            >
              {link}
            </StudioSubsetZone>
          );
        })}
      </nav>
    </LegacyNavStudio>
  );
}
