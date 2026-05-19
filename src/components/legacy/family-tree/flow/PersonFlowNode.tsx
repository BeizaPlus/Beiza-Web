import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AudioLines } from "lucide-react";
import type { PersonNodeData } from "@/lib/legacy/familyTreeFlow";
import { cn } from "@/lib/utils";

function PersonFlowNodeComponent({ data }: NodeProps & { data: PersonNodeData }) {
  const isGone = data.status === "gone";
  const isLiving = data.status === "living";

  return (
    <div
      className={cn(
        "w-[200px] min-h-[240px] overflow-hidden rounded-xl bg-[#111111] text-left shadow-none",
        isLiving && "family-tree-person-living border border-[#E6A817]",
        isGone && "border border-[#2a2a2a] grayscale-[0.4]",
        data.status === "invited" && "border border-dashed border-[#2a2a2a]",
        data.selected && "ring-2 ring-primary/50",
      )}
    >
      <Handle type="target" position={Position.Top} className="!border-none !bg-transparent !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!border-none !bg-transparent !w-2 !h-2" />
      <Handle type="source" position={Position.Right} id="memories" className="!border-none !bg-transparent !w-2 !h-2" />

      <div className="relative h-[140px] w-full overflow-hidden">
        {data.photoUrl ? (
          <img
            src={data.photoUrl}
            alt=""
            className={cn("h-full w-full object-cover", isGone && "grayscale")}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: "linear-gradient(160deg, #1a1200, #0a0a0a)" }}
          >
            <span className="text-[36px] font-medium text-[#E6A817] opacity-40">{data.initials}</span>
          </div>
        )}
      </div>

      <div className="space-y-1 p-3">
        <p className="text-sm font-medium text-white">{data.name}</p>
        {data.relation ? (
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#555555]">{data.relation}</p>
        ) : null}
        {data.memoryCount > 0 ? (
          <p className="text-[10px] text-[#E6A817]">
            {data.memoryCount} {data.memoryCount === 1 ? "memory" : "memories"}
          </p>
        ) : null}
        {isGone && data.memoryCount > 0 ? (
          <p className="flex items-center gap-1 text-[10px] text-[#E6A817]">
            <AudioLines className="h-3 w-3" aria-hidden />
            Voice preserved
          </p>
        ) : null}
      </div>
    </div>
  );
}

export const PersonFlowNode = memo(PersonFlowNodeComponent);
