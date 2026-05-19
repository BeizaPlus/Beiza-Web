import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Plus } from "lucide-react";
import type { PlaceholderNodeData } from "@/lib/legacy/familyTreeFlow";

function PlaceholderFlowNodeComponent({ data }: NodeProps & { data: PlaceholderNodeData }) {
  return (
    <button
      type="button"
      className="flex w-[160px] flex-col items-center gap-2 rounded-xl border border-dashed border-[#2a2a2a] bg-transparent px-3.5 py-5 text-center"
    >
      <Handle type="target" position={Position.Bottom} className="!border-none !bg-transparent !w-2 !h-2" />
      <Handle type="source" position={Position.Top} className="!border-none !bg-transparent !w-2 !h-2" />
      <Plus className="h-5 w-5 text-[#333333]" aria-hidden />
      <span className="text-[11px] text-[#444444]">{data.label}</span>
    </button>
  );
}

export const PlaceholderFlowNode = memo(PlaceholderFlowNodeComponent);
