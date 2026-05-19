import { Link } from "react-router-dom";

const GOLD = "#E6A817";

const FEATURES = [
  "Delete any memory at any time",
  "Rename and organize recordings",
  "Unlimited vault storage",
] as const;

/** Copy-only upsell — layout from mockup; icons stay on nav/cards elsewhere. */
export function LegacyVaultPlusUpsell() {
  return (
    <aside
      className="mt-2 rounded-xl border border-[#3a2500] bg-[#1a1100] p-4"
      role="complementary"
      aria-label="Upgrade prompt"
    >
      <div className="mb-2.5">
        <p
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: GOLD }}
        >
          Legacy Plus
        </p>
        <p className="text-sm font-semibold text-white">Unlock full vault control</p>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-[#888]">
        Basic plan memories are permanent — upgrade to manage, delete, and organize your
        family&apos;s stories.
      </p>

      <ul className="mb-3.5 flex flex-col gap-1.5">
        {FEATURES.map((label) => (
          <li key={label} className="flex items-center gap-2 text-xs text-[#bbb]">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: GOLD }}
              aria-hidden
            />
            {label}
          </li>
        ))}
      </ul>

      <Link
        to="/#legacy-curation"
        className="block w-full rounded-lg py-2.5 text-center text-[13px] font-bold tracking-wide text-[#111] transition-opacity hover:opacity-90"
        style={{ backgroundColor: GOLD }}
      >
        Upgrade to Legacy Plus ↗
      </Link>
    </aside>
  );
}
