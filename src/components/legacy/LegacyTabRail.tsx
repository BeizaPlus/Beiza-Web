import { Link, useLocation, useNavigate } from "react-router-dom";
import { LegacyNavIcon } from "@/components/legacy/LegacyNavIcon";
import { LEGACY_TAB_ITEMS } from "@/components/legacy/LegacyTabBar";
import { useLegacyShell } from "@/components/legacy/legacyShellContext";
import { LegacyNavStudio } from "@/components/legacy/LegacyNavStudio";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

/**
 * Record station — vertical Legacy nav (Home · Tree · Record · Vault · Invite).
 * Logged out: URL updates for active tab only (same sign-in screen).
 * Signed in: navigates to real legacy pages.
 */
export function LegacyTabRail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signedIn: signedInFromShell } = useLegacyShell();

  const goToTab = async (href: string, e: React.MouseEvent) => {
    const { data } = await supabase!.auth.getSession();
    const hasSession = Boolean(data.session) || signedInFromShell;
    if (!hasSession) return;
    e.preventDefault();
    if (location.pathname === href) return;
    navigate(href);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <LegacyNavStudio
        recordOverlay
        className="legacy-record-tab-rail pointer-events-auto"
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
            return (
              <Link
                key={item.href}
                to={item.href}
                title={item.label}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                onClick={(e) => void goToTab(item.href, e)}
                className={cn(
                  "flex items-center justify-center rounded-full transition-colors",
                  "h-9 w-9 max-md:h-10 max-md:w-10 md:h-10 md:w-10",
                  active
                    ? "bg-white text-black shadow-sm"
                    : "text-white/55 hover:bg-white/10 hover:text-white/90",
                )}
              >
                <LegacyNavIcon name={item.icon} active={active} className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>
      </LegacyNavStudio>
    </div>
  );
}
