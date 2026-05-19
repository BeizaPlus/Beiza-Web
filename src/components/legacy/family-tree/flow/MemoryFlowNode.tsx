import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";
import type { MemoryNodeData } from "@/lib/legacy/familyTreeFlow";

function MemoryFlowNodeComponent({ data }: NodeProps & { data: MemoryNodeData }) {
  return (
    <div className="w-[220px] rounded-lg border border-[#3a2800]/80 bg-[#0e0c00] p-3.5">
      <Handle type="target" position={Position.Left} className="!border-none !bg-transparent !w-2 !h-2" />
      <div className="flex gap-2.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E6A817] text-[#0a0a0a]">
          <Play className="h-2.5 w-2.5 fill-current" aria-hidden />
        </span>
        <p className="line-clamp-2 flex-1 font-[family-name:var(--font-manrope)] text-xs italic leading-snug text-[#888888]">
          {data.prompt}
        </p>
      </div>
      <p className="mt-2 text-[10px] text-[#555555]">
        {Math.floor(data.durationSeconds / 60)}:{String(data.durationSeconds % 60).padStart(2, "0")} ·{" "}
        {data.recordedAt}
      </p>
      <p className="mt-1 text-[11px] text-[#666666]">— recorded by {data.recordedByName}</p>
    </div>
  );
}

export const MemoryFlowNode = memo(MemoryFlowNodeComponent);
