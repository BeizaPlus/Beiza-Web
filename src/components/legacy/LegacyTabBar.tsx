import { Link, useLocation } from "react-router-dom";
import { LegacyNavIcon, type LegacyNavIconName } from "@/components/legacy/LegacyNavIcon";
import { LegacyNavStudio } from "@/components/legacy/LegacyNavStudio";
import { siteBounds } from "@/lib/siteLayout";
import { cn } from "@/lib/utils";

/** Signature Legacy tab row — Home · Tree · Record · Vault · Invite (all /legacy/* pages). */
export const LEGACY_TAB_ITEMS: {
  href: string;
  label: string;
  icon: LegacyNavIconName;
  end?: boolean;
}[] = [
  { href: "/legacy", label: "Home", icon: "home", end: true },
  { href: "/legacy/circle", label: "Tree", icon: "family" },
  { href: "/legacy/record", label: "Record", icon: "record" },
  { href: "/legacy/vault", label: "Vault", icon: "vault" },
  { href: "/legacy/family", label: "Invite", icon: "well" },
];

const TAB_ACTIVE =
  "bg-[#f5c518] text-black shadow-sm [&_.legacy-nav-tab-label]:font-medium [&_.legacy-nav-tab-label]:text-black";
const TAB_IDLE =
  "text-white/55 hover:bg-white/8 hover:text-white/90 [&_.legacy-nav-tab-label]:text-white/55";

type LegacyTabBarProps = {
  /** Record station: tabs overlay the hero (no extra black flex row). */
  placement?: "stacked" | "overlay";
};

export function LegacyTabBar({ placement = "stacked" }: LegacyTabBarProps) {
  const location = useLocation();
  const overlay = placement === "overlay";

  return (
    <div
      className={cn(
        overlay
          ? "pointer-events-none absolute inset-x-0 bottom-0 z-30 w-full"
          : "w-full",
        siteBounds,
      )}
    >
      <LegacyNavStudio
        disableTransform={overlay}
        className={cn(
          "w-full max-w-none",
          overlay
            ? "border-t border-white/10 bg-black/80 backdrop-blur-sm [&_nav]:pointer-events-auto"
            : "border-b border-white/10 bg-black",
        )}
      >
      <nav className="mx-auto flex w-full min-w-0 gap-1 py-2.5" aria-label="Legacy">
        {LEGACY_TAB_ITEMS.map((item) => {
          const active = item.end
            ? location.pathname === item.href
            : location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 text-center text-xs font-medium transition-colors sm:px-2",
                active ? TAB_ACTIVE : TAB_IDLE,
              )}
            >
              <LegacyNavIcon name={item.icon} active={active} />
              <span className="legacy-nav-tab-label leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      </LegacyNavStudio>
    </div>
  );
}
