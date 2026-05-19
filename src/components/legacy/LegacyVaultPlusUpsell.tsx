import { Link } from "react-router-dom";
import { Crown, Download, Sparkles, Trash2 } from "lucide-react";

const GOLD = "#E6A817";

const FEATURES = [
  { icon: Trash2, label: "Delete any memory at any time" },
  { icon: Download, label: "Download & share recordings" },
  { icon: Sparkles, label: "Story cards from your photos" },
] as const;

export function LegacyVaultPlusUpsell() {
  return (
    <aside
      className="mt-2 rounded-xl border border-[#3a2500] bg-[#1a1100] p-4"
      role="complementary"
      aria-label="Upgrade prompt"
    >
      <div className="mb-2.5 flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: "#2e1f00" }}
        >
          <Crown className="h-4 w-4" style={{ color: GOLD }} aria-hidden />
        </div>
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: GOLD }}
          >
            Keeper
          </p>
          <p className="text-sm font-semibold text-white">Unlock vault control with Keeper</p>
        </div>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-[#888]">
        Basic plan memories are permanent — upgrade to manage, delete, and organize your
        family&apos;s stories.
      </p>

      <ul className="mb-3.5 flex flex-col gap-1.5">
        {FEATURES.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-xs text-[#bbb]">
            <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} aria-hidden />
            {label}
          </li>
        ))}
      </ul>

      <Link
        to="/pricing"
        className="block w-full rounded-lg py-2.5 text-center text-[13px] font-bold tracking-wide text-[#111] transition-opacity hover:opacity-90"
        style={{ backgroundColor: GOLD }}
      >
        Upgrade to Keeper — $4.99/mo ↗
      </Link>
    </aside>
  );
}
