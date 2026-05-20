import { cn } from "@/lib/utils";

export type PersonPanelTab = "profile" | "health" | "memories" | "patterns";

const TABS: { id: PersonPanelTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "health", label: "Health" },
  { id: "memories", label: "Memories" },
  { id: "patterns", label: "Patterns" },
];

type PersonPanelTabsProps = {
  active: PersonPanelTab;
  onChange: (tab: PersonPanelTab) => void;
};

export function PersonPanelTabs({ active, onChange }: PersonPanelTabsProps) {
  return (
    <div className="flex gap-1 border-b border-[#1e1e1e] px-5 pb-0 pt-3">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-t-lg px-3 py-2 font-manrope text-[11px] uppercase tracking-wider transition",
            active === tab.id
              ? "border border-b-0 border-[#2a2a2a] bg-[#111111] text-[#E6A817]"
              : "text-[#666666] hover:text-white",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
