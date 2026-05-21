import { Link, useLocation } from "react-router-dom";
import { LegacyNavIcon } from "@/components/legacy/LegacyNavIcon";
import { LEGACY_TAB_ITEMS } from "@/components/legacy/LegacyTabBar";
import { LegacyNavStudio } from "@/components/legacy/LegacyNavStudio";
import { cn } from "@/lib/utils";

/**
 * Record station — vertical Legacy nav (Home · Tree · Record · Vault · Invite).
 * Replaces the horizontal tab bar on /legacy/record.
 */
export function LegacyTabRail() {
  const location = useLocation();

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <LegacyNavStudio recordOverlay className="pointer-events-auto">
        <nav
          className="flex flex-col items-center gap-1 rounded-full border border-white/10 bg-black/80 p-2 shadow-lg backdrop-blur-sm"
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
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
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
