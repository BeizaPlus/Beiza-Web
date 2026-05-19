import { Link, Outlet, useLocation } from "react-router-dom";
import { LegacyAuthGate } from "@/components/legacy/LegacyAuthGate";
import { LegacyNavIcon, type LegacyNavIconName } from "@/components/legacy/LegacyNavIcon";
import { cn } from "@/lib/utils";

const nav: {
  href: string;
  label: string;
  icon: LegacyNavIconName;
  end?: boolean;
}[] = [
  { href: "/legacy", label: "Home", icon: "home", end: true },
  { href: "/legacy/record", label: "Record", icon: "record" },
  { href: "/legacy/vault", label: "Vault", icon: "vault" },
  { href: "/legacy/family", label: "Circle", icon: "family" },
];

export function LegacyLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-[hsl(var(--surface))]/90 backdrop-blur-md">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center gap-3">
            <LegacyNavIcon name="vault" active className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Beiza Legacy
              </p>
              <h1 className="font-heading text-lg font-semibold text-primary">
                Your Family&apos;s Legacy Vault
              </h1>
            </div>
          </div>
        </div>
        <nav className="mx-auto flex max-w-lg gap-1 px-4 pb-3" aria-label="Legacy">
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
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-lg px-4 py-6">
        <LegacyAuthGate>
          <Outlet />
        </LegacyAuthGate>
      </main>
    </div>
  );
}