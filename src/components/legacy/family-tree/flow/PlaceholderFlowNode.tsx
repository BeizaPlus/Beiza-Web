import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Plus } from "lucide-react";
import type { PlaceholderNodeData } from "@/lib/legacy/familyTreeFlow";

function PlaceholderFlowNodeComponent({ data }: NodeProps & { data: PlaceholderNodeData }) {
  const shortLabel = data.label.replace(/^Add\s+/i, "").replace(/\s*→$/, "") || "Add";

  return (
    <button
      type="button"
      className="flex h-[80px] w-[160px] flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed border-[#222222] bg-transparent text-center"
    >
      <Handle type="target" position={Position.Bottom} className="!h-2 !w-2 !border-none !bg-transparent" />
      <Handle type="source" position={Position.Top} className="!h-2 !w-2 !border-none !bg-transparent" />
      <Plus className="h-[18px] w-[18px] text-[#333333]" aria-hidden />
      <span className="font-manrope text-[10px] text-[#333333]">{shortLabel} →</span>
    </button>
  );
}

export const PlaceholderFlowNode = memo(PlaceholderFlowNodeComponent);
