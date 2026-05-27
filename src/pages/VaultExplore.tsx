import { useState } from "react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { legacySurface, marketingContainer } from "@/lib/brandUi";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { cn } from "@/lib/utils";

const SEED_VAULTS = [
  { id: "1", name: "The Oppong Family", initials: "OF", memories: 24, created: "Mar 2026" },
  { id: "2", name: "Essel Circle", initials: "EC", memories: 12, created: "Feb 2026" },
  { id: "3", name: "MadamRose Legacy", initials: "MR", memories: 8, created: "Jan 2026" },
  { id: "4", name: "The Mensah Archive", initials: "TM", memories: 31, created: "Dec 2025" },
  { id: "5", name: "Amponsah Family", initials: "AF", memories: 6, created: "Nov 2025" },
  { id: "6", name: "London Branch — Ofori", initials: "LO", memories: 15, created: "Oct 2025" },
] as const;

export default function VaultExplore() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className={cn(marketingContainer, "py-16")}>
        <header className="max-w-2xl">
          <p className="text-eyebrow">Beiza Legacy</p>
          <h1 className="mt-2 text-display-lg text-white">Legacies being preserved</h1>
          <p className="mt-4 text-base leading-relaxed text-subtle">
            Families who started their circle on Beiza. Their stories are theirs — you can only see
            the cover.
          </p>
        </header>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SEED_VAULTS.map((vault) => (
            <li key={vault.id} className="relative">
              <button
                type="button"
                className={cn(
                  legacySurface,
                  "glass-panel w-full rounded-2xl border-white/10 p-5 text-left transition hover:border-white/20",
                )}
                onClick={() => setActiveId(vault.id)}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
                  {vault.initials}
                </span>
                <p className="mt-4 text-base font-medium text-white">{vault.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {vault.memories} memories · {vault.created}
                </p>
              </button>
              {activeId === vault.id ? (
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/80 px-4 text-center backdrop-blur-sm"
                  role="tooltip"
                >
                  <p className="text-sm text-subtle">
                    This vault is private. Only family members can enter.
                  </p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          <Link
            to={BEIZA_LINKS.legacy.family}
            className="underline decoration-border underline-offset-4 hover:text-primary"
          >
            Start your family&apos;s circle — free
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
