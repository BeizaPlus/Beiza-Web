import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  RELATIONSHIP_OPTIONS,
  type RelationshipType,
} from "@/lib/legacy/treeRelationships";

type RelationshipPickerModalProps = {
  open: boolean;
  sourceName: string;
  targetName: string;
  onConfirm: (relationshipType: RelationshipType) => void;
  onCancel: () => void;
};

export function RelationshipPickerModal({
  open,
  sourceName,
  targetName,
  onConfirm,
  onCancel,
}: RelationshipPickerModalProps) {
  const [selected, setSelected] = useState<RelationshipType | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelected(null);
      onCancel();
    }
  };

  const confirm = () => {
    if (!selected) return;
    onConfirm(selected);
    setSelected(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="z-[100] max-w-sm border-[#1e1e1e] bg-[#111111] text-white sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-center font-manrope text-base font-medium text-white">
            How are these people related?
          </DialogTitle>
        </DialogHeader>

        <p className="text-center font-manrope text-sm text-[#888888]">
          {sourceName} → {targetName}
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {RELATIONSHIP_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => setSelected(opt.type)}
              className={cn(
                "rounded-full px-3 py-1.5 font-manrope text-xs transition-colors",
                selected === opt.type
                  ? "bg-[#E6A817] text-[#0a0a0a]"
                  : "bg-[#1a1a1a] text-[#cccccc] hover:bg-[#222222]",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            disabled={!selected}
            onClick={confirm}
            className="rounded-full bg-[#E6A817] px-6 py-2 font-manrope text-sm font-medium text-[#0a0a0a] disabled:opacity-40"
          >
            Confirm →
          </button>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="font-manrope text-xs text-[#666666] hover:text-[#888888]"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
