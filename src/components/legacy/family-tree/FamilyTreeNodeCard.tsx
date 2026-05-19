import { AudioLines } from "lucide-react";
import type { FamilyPersonStatus } from "@/lib/legacy/types";
import { cn } from "@/lib/utils";

export type FamilyTreeNodeCardProps = {
  name: string;
  initials: string;
  status: FamilyPersonStatus;
  memoryCount: number;
  selected?: boolean;
  onClick?: () => void;
};

const STATUS_STYLES: Record<
  FamilyPersonStatus,
  { card: string; avatar: string; pulse?: boolean }
> = {
  living: {
    card: "border-[1.5px] border-[#E6A817] bg-[#0e0c00]",
    avatar: "bg-[#1e1800] text-[#E6A817]",
    pulse: true,
  },
  gone: {
    card: "border border-[#2a2a2a] bg-[#0d0d0d]",
    avatar: "bg-[#1a1a1a] text-[#666666] grayscale",
  },
  invited: {
    card: "border border-dashed border-[#2a2a2a] bg-transparent",
    avatar: "bg-transparent text-[#333333]",
  },
};

export function FamilyTreeNodeCard({
  name,
  initials,
  status,
  memoryCount,
  selected,
  onClick,
}: FamilyTreeNodeCardProps) {
  const styles = STATUS_STYLES[status];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-[80px] w-[120px] flex-col items-center justify-center rounded-lg px-2 py-2 text-center transition",
        styles.card,
        styles.pulse && "family-tree-node-living",
        selected && "ring-2 ring-primary/60",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold",
          styles.avatar,
        )}
      >
        {initials}
      </span>
      <span className="mt-1.5 line-clamp-2 w-full text-[11px] font-medium leading-tight text-white">
        {name}
      </span>
      {status === "invited" ? (
        <span className="mt-0.5 text-[10px] text-[#444444]">Awaiting</span>
      ) : null}
      {status === "gone" && memoryCount > 0 ? (
        <AudioLines className="absolute right-2 top-2 h-3.5 w-3.5 text-primary" aria-hidden />
      ) : null}
      {memoryCount > 0 ? (
        <span className="absolute bottom-1.5 right-1.5 text-[10px] text-primary">
          {memoryCount} {memoryCount === 1 ? "memory" : "memories"}
        </span>
      ) : null}
    </button>
  );
}
