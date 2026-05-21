import { Link, Outlet, useLocation } from "react-router-dom";
import { LegacyAuthGate } from "@/components/legacy/LegacyAuthGate";
import { Navigation } from "@/components/Navigation";
import { LegacyNavIcon, type LegacyNavIconName } from "@/components/legacy/LegacyNavIcon";
import { PageLayoutStudioZone } from "@/components/dev/PageLayoutStudioZone";
import { LegacyNavStudio } from "@/components/legacy/LegacyNavStudio";
import { LEGACY_AUTH_PAGE_STUDIO_ID, resolveLegacyPageStudioId } from "@/lib/pageLayoutStudio";
import { useLegacySession } from "@/hooks/useLegacy";
import { cn } from "@/lib/utils";

const nav: {
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

export function LegacyLayout() {
  const location = useLocation();
  const { data: session, isLoading: sessionLoading } = useLegacySession();
  const isTreeRoute = location.pathname === "/legacy/circle";
  /** Fullscreen tree only after sign-in; before auth keep the same shell as Record/Vault */
  const treeFullscreen = isTreeRoute && !!session;
  const pageStudioId = session
    ? resolveLegacyPageStudioId(location.pathname)
    : LEGACY_AUTH_PAGE_STUDIO_ID;

  if (treeFullscreen) {
    return (
      <LegacyAuthGate>
        <Outlet />
      </LegacyAuthGate>
    );
  }

  if (sessionLoading && isTreeRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <LegacyNavStudio className="border-b border-border/60 bg-background/90 backdrop-blur-md">
        <nav className="mx-auto flex w-full gap-1 px-4 py-2" aria-label="Legacy">
          {nav.map((item) => {
            const active = item.end
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 text-center text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <LegacyNavIcon
                  name={item.icon}
                  active={active}
                  className={cn(active && "text-primary-foreground")}
                />
                <span className="legacy-nav-tab-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </LegacyNavStudio>
      <main className="relative min-h-[calc(100dvh-10.5rem)] overflow-visible">
        <PageLayoutStudioZone pageId={pageStudioId} className="px-4 py-6" copyLiftTarget="children">
          <LegacyAuthGate>
            <Outlet />
          </LegacyAuthGate>
        </PageLayoutStudioZone>
      </main>
    </div>
  );
}
