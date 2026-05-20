import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PERSON_RELATION_LABELS } from "@/lib/legacy/personRelationLabels";
import { cn } from "@/lib/utils";

type PersonNodeEditMenuProps = {
  personId: string;
  name: string;
  relation: string;
  onSave: (personId: string, displayName: string, relationLabel: string) => void;
};

export function PersonNodeEditMenu({ personId, name, relation, onSave }: PersonNodeEditMenuProps) {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(name);
  const [relationLabel, setRelationLabel] = useState(relation || "FAMILY");

  const save = () => {
    const trimmed = displayName.trim();
    if (!trimmed) return;
    onSave(personId, trimmed, relationLabel.trim().toUpperCase() || "FAMILY");
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setDisplayName(name);
          setRelationLabel(relation || "FAMILY");
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="node-relation-chevron nodrag nopan absolute right-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-[#0a0a0a]/80 text-[#E6A817] hover:bg-[#1a1a1a]"
          aria-label="Edit name and role"
          onClick={(e) => e.stopPropagation()}
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="tree-chrome nodrag nopan z-[100] w-52 border-[#1e1e1e] bg-[#111111] p-3 text-white shadow-xl"
        align="end"
        side="bottom"
        onClick={(e) => e.stopPropagation()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <p className="mb-2 font-manrope text-[10px] uppercase tracking-wider text-[#555555]">
          Who is this?
        </p>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mb-2 h-8 border-[#2a2a2a] bg-[#0a0a0a] text-sm text-white"
          placeholder="Name"
        />
        <p className="mb-1 font-manrope text-[10px] uppercase tracking-wider text-[#555555]">Role</p>
        <select
          value={relationLabel}
          onChange={(e) => setRelationLabel(e.target.value)}
          className="mb-3 h-8 w-full rounded-md border border-[#2a2a2a] bg-[#0a0a0a] px-2 font-manrope text-xs text-white"
        >
          {PERSON_RELATION_LABELS.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
        <Button
          type="button"
          size="sm"
          className="h-8 w-full rounded-full bg-[#E6A817] text-xs font-medium text-[#0a0a0a] hover:bg-[#E6A817]/90"
          onClick={save}
        >
          Save
        </Button>
      </PopoverContent>
    </Popover>
  );
}
