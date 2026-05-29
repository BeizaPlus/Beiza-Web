import { Link, useLocation } from "react-router-dom";
import { StudioSubsetZone } from "@/components/dev/StudioSubsetZone";
import { LegacyNavIcon } from "@/components/legacy/LegacyNavIcon";
import { LEGACY_TAB_ITEMS } from "@/components/legacy/LegacyTabBar";
import { LegacyNavStudio } from "@/components/legacy/LegacyNavStudio";
import { useLayoutStudio } from "@/context/LayoutStudioContext";
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
  const { tabRailHidden, setTabRailHidden } = useLayoutStudio();
  const studioCtx = useRecordLayoutStudio();
  const tabFrame = studioCtx?.tabFrame;
  const goToTab = useLegacyTabNavigate();

  if (studioOn && tabRailHidden) {
    return (
      <button
        type="button"
        className={cn(
          "fixed right-0 top-1/2 z-[85] -translate-y-1/2 rounded-l-md border border-r-0 border-white/15",
          "bg-black/90 px-2 py-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/70",
          "shadow-lg backdrop-blur-sm hover:bg-black hover:text-white",
          "max-[767px]:bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] max-[767px]:top-auto max-[767px]:translate-y-0",
        )}
        onClick={() => setTabRailHidden(false)}
        title="Show legacy navigation (Home · Record · Vault)"
        aria-label="Show legacy tab rail"
      >
        <span className="[writing-mode:vertical-rl]">Nav</span>
      </button>
    );
  }

  return (
    <LegacyNavStudio
      recordOverlay
      className="legacy-record-tab-rail"
      studioSelectable={studioOn}
    >
      <nav
        className={cn(
          "items-center gap-1 rounded-full border border-white/10 bg-black/80 p-2 shadow-lg backdrop-blur-sm",
          "flex flex-row max-[767px]:px-2.5 max-[767px]:py-2",
          "min-[768px]:flex-col",
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
                "h-9 w-9 max-[767px]:h-10 max-[767px]:w-10 min-[768px]:h-10 min-[768px]:w-10",
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
