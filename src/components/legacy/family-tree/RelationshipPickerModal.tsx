import { useEffect, useState } from "react";
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
import type {
  ConnectionDirection,
  InferredRelationshipChoice,
} from "@/lib/legacy/treeConnectionInference";

type RelationshipPickerModalProps = {
  open: boolean;
  mode?: "create" | "edit";
  currentRelationshipType?: RelationshipType;
  sourceName: string;
  targetName: string;
  connectionDirection?: ConnectionDirection | null;
  inferredChoices?: InferredRelationshipChoice[] | null;
  onConfirm: (relationshipType: RelationshipType) => void;
  onCancel: () => void;
};

const DIRECTION_HINT: Record<ConnectionDirection, string> = {
  parent_to_child: "Parent connecting down to child",
  child_to_parent: "Child connecting up to parent",
  sibling: "Same generation — sibling link",
  diagonal: "Choose how they relate",
};

export function RelationshipPickerModal({
  open,
  mode = "create",
  currentRelationshipType,
  sourceName,
  targetName,
  connectionDirection,
  inferredChoices,
  onConfirm,
  onCancel,
}: RelationshipPickerModalProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const priorityOptions = inferredChoices && inferredChoices.length > 0 ? inferredChoices : null;
  const priorityKeys = new Set(priorityOptions?.map((o) => o.label.toLowerCase()) ?? []);
  const remainingOptions = RELATIONSHIP_OPTIONS
    .map((opt) => ({ type: opt.type, label: opt.label }))
    .filter((opt) => !priorityKeys.has(opt.label.toLowerCase()));

  useEffect(() => {
    if (!open) {
      setSelectedKey(null);
      return;
    }
    if (mode === "edit" && currentRelationshipType) {
      const label =
        RELATIONSHIP_OPTIONS.find((o) => o.type === currentRelationshipType)?.label ??
        currentRelationshipType;
      setSelectedKey(`${currentRelationshipType}:${label}`);
    }
  }, [open, mode, currentRelationshipType]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedKey(null);
      onCancel();
    }
  };

  const confirm = () => {
    if (!selectedKey) return;
    const allOptions = [...(priorityOptions ?? []), ...remainingOptions];
    const choice = allOptions.find((opt) => `${opt.type}:${opt.label}` === selectedKey);
    if (!choice) return;
    onConfirm(choice.type);
    setSelectedKey(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="tree-chrome z-[100] max-w-sm border-[#1e1e1e] bg-[#111111] text-white sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-center font-manrope text-base font-medium text-white">
            {mode === "edit" ? "Edit this relationship" : "How are these people related?"}
          </DialogTitle>
        </DialogHeader>

        <p className="text-center font-manrope text-sm text-[#888888]">
          {sourceName} → {targetName}
        </p>

        {connectionDirection ? (
          <p className="mt-1 text-center font-manrope text-[11px] italic text-[#666666]">
            {DIRECTION_HINT[connectionDirection]}
          </p>
        ) : null}

        {/* Priority options — large, shown first */}
        {priorityOptions ? (
          <div className="mt-4 flex justify-center gap-3">
            {priorityOptions.map((opt) => {
              const key = `${opt.type}:${opt.label}`;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  className={cn(
                    "rounded-full px-5 py-2 font-manrope text-sm font-medium transition-colors",
                    selectedKey === key
                      ? "bg-[#E6A817] text-[#0a0a0a]"
                      : "border border-[#333333] bg-[#1a1a1a] text-white hover:border-[#E6A817]/40",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : null}

        {/* All other options */}
        {remainingOptions.length > 0 ? (
          <>
            <p className="mt-4 text-center font-manrope text-[10px] uppercase tracking-[0.1em] text-[#333333]">
              {priorityOptions ? "or" : "Choose relationship"}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {remainingOptions.map((opt) => {
                const key = `${opt.type}:${opt.label}`;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedKey(key)}
                    className={cn(
                      "rounded-full px-3 py-1.5 font-manrope text-xs transition-colors",
                      selectedKey === key
                        ? "bg-[#E6A817] text-[#0a0a0a]"
                        : "bg-[#1a1a1a] text-[#888888] hover:bg-[#222222] hover:text-[#cccccc]",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            disabled={!selectedKey}
            onClick={confirm}
            className="rounded-full bg-[#E6A817] px-6 py-2 font-manrope text-sm font-medium text-[#0a0a0a] disabled:opacity-40"
          >
            {mode === "edit" ? "Save relationship" : "Confirm →"}
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
