import { useState } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

const GOLD = "#E6A817";

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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navigation />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <header className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#888]">
            Beiza Legacy
          </p>
          <h1 className="mt-2 font-display text-3xl font-normal md:text-4xl">
            Legacies being preserved
          </h1>
          <p className="mt-4 font-sans text-base leading-relaxed text-[#888]">
            Families who started their circle on Beiza. Their stories are theirs — you can only see
            the cover.
          </p>
        </header>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SEED_VAULTS.map((vault) => (
            <li key={vault.id} className="relative">
              <button
                type="button"
                className="w-full rounded-2xl border border-[#1e1e1e] bg-[#111111] p-5 text-left transition hover:border-[#2a2a2a]"
                onClick={() => setActiveId(vault.id)}
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#2e2200] bg-[#1e1800] text-sm font-semibold"
                  style={{ color: GOLD }}
                >
                  {vault.initials}
                </span>
                <p className="mt-4 font-sans text-base font-medium text-white">{vault.name}</p>
                <p className="mt-1 font-sans text-xs text-[#555]">
                  {vault.memories} memories · {vault.created}
                </p>
              </button>
              {activeId === vault.id ? (
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/80 px-4 text-center backdrop-blur-sm"
                  role="tooltip"
                >
                  <p className="font-sans text-sm text-[#ccc]">
                    This vault is private. Only family members can enter.
                  </p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>

        <p className="mt-12 text-center font-sans text-sm text-[#555]">
          <Link to="/legacy/family" className="underline decoration-[#333] underline-offset-4 hover:text-[#E6A817]">
            Start your family&apos;s circle — free
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
