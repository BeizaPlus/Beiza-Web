import { Link, Outlet, useLocation } from "react-router-dom";
import { LegacyAuthGate } from "@/components/legacy/LegacyAuthGate";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/legacy", label: "Home", end: true },
  { href: "/legacy/record", label: "Record" },
  { href: "/legacy/vault", label: "Vault" },
  { href: "/legacy/family", label: "Circle" },
] as const;

export function LegacyLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-[hsl(var(--surface))]/90 backdrop-blur-md">
        <div className="mx-auto max-w-lg px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Beiza Legacy
          </p>
          <h1 className="font-heading text-lg font-semibold text-primary">
            Your Family&apos;s Legacy Vault
          </h1>
        </div>
        <nav className="mx-auto flex max-w-lg gap-1 px-4 pb-3">
          {nav.map((item) => {
            const active = item.end
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex-1 rounded-md px-2 py-2 text-center text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {item.label}
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
