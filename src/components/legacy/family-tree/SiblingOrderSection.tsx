import { ChevronDown, ChevronUp } from "lucide-react";
import type { FamilyPerson } from "@/lib/legacy/types";
import {
  moveSiblingEarlier,
  moveSiblingLater,
  sortedSiblingGroup,
} from "@/lib/legacy/siblingBirthOrder";
import { cn } from "@/lib/utils";

type Props = {
  person: FamilyPerson;
  circlePeople: FamilyPerson[];
  editable: boolean;
  onReorder: (updates: { personId: string; sibling_order: number }[]) => Promise<void>;
};

function orderLabel(position: number): string {
  if (position === 1) return "1st born (eldest)";
  if (position === 2) return "2nd born";
  if (position === 3) return "3rd born";
  return `${position}th born`;
}

export function SiblingOrderSection({ person, circlePeople, editable, onReorder }: Props) {
  const group = sortedSiblingGroup(person, circlePeople);
  if (group.length <= 1) return null;

  const position = group.findIndex((p) => p.id === person.id) + 1;

  const move = async (direction: "earlier" | "later") => {
    const updates =
      direction === "earlier"
        ? moveSiblingEarlier(person.id, group)
        : moveSiblingLater(person.id, group);
    if (!updates) return;
    await onReorder(updates);
  };

  return (
    <div className="space-y-2">
      <p className={cn("font-manrope text-[10px] font-normal uppercase tracking-[0.2em] text-[#333333]")}>
        Birth order (siblings)
      </p>
      <p className="font-manrope text-[11px] text-[#666666]">
        Eldest is laid out first when you use auto-arrange. Same parent on the tree.
      </p>

      <ol className="space-y-1 rounded-lg border border-[#2a2a2a] bg-[#111111] p-2">
        {group.map((sibling, index) => (
          <li
            key={sibling.id}
            className={cn(
              "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 font-manrope text-[12px]",
              sibling.id === person.id
                ? "bg-[#1e1800] text-[#E6A817]"
                : "text-[#888888]",
            )}
          >
            <span className="min-w-0 truncate">
              <span className="tabular-nums text-[#555555]">{index + 1}.</span>{" "}
              {sibling.display_name}
              {sibling.birth_year ? (
                <span className="text-[#555555]"> · {sibling.birth_year}</span>
              ) : null}
            </span>
            {sibling.sibling_order != null ? (
              <span className="shrink-0 text-[10px] text-[#555555]">#{sibling.sibling_order}</span>
            ) : null}
          </li>
        ))}
      </ol>

      {editable ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-manrope text-[12px] text-[#888888]">
            {person.display_name}: {orderLabel(position)}
          </span>
          <button
            type="button"
            disabled={position <= 1}
            onClick={() => void move("earlier")}
            className="inline-flex items-center gap-1 rounded-md border border-[#2a2a2a] bg-[#111111] px-2 py-1 font-manrope text-[11px] text-[#888888] transition hover:border-[#E6A817]/40 hover:text-[#E6A817] disabled:opacity-40"
            title="Move earlier in birth order (more eldest)"
          >
            <ChevronUp className="h-3.5 w-3.5" />
            More eldest
          </button>
          <button
            type="button"
            disabled={position >= group.length}
            onClick={() => void move("later")}
            className="inline-flex items-center gap-1 rounded-md border border-[#2a2a2a] bg-[#111111] px-2 py-1 font-manrope text-[11px] text-[#888888] transition hover:border-[#E6A817]/40 hover:text-[#E6A817] disabled:opacity-40"
            title="Move later in birth order (younger)"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            More youngest
          </button>
        </div>
      ) : null}
    </div>
  );
}
