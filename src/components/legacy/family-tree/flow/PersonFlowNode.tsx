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
        "w-[180px] cursor-pointer overflow-hidden rounded-[10px] bg-[#111111] text-left",
        isLiving && "family-tree-person-living border border-[#E6A817]",
        isGone && "border border-[#2a2a2a]",
        data.status === "invited" && "border border-dashed border-[#2a2a2a]",
        data.selected && "ring-2 ring-primary/50",
      )}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-none !bg-transparent" />
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-none !bg-transparent" />
      <Handle
        type="source"
        position={Position.Right}
        id="memories"
        className="!h-2 !w-2 !border-none !bg-transparent"
      />

      <div className="relative h-[100px] w-full overflow-hidden">
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
            <span className="text-[32px] font-medium text-[#E6A817] opacity-50">{data.initials}</span>
          </div>
        )}
      </div>

      <div className="space-y-0.5 px-3 py-2.5">
        <p className="truncate font-manrope text-[13px] font-medium text-white">{data.name}</p>
        {data.relation ? (
          <p className="font-manrope text-[10px] font-normal uppercase tracking-[0.08em] text-[#555555]">
            {data.relation}
          </p>
        ) : null}
        {data.memoryCount > 0 ? (
          <p className="font-manrope text-[10px] text-[#E6A817]">
            {data.memoryCount} {data.memoryCount === 1 ? "memory" : "memories"}
          </p>
        ) : null}
        {isGone && data.memoryCount > 0 ? (
          <p className="flex items-center gap-1 font-manrope text-[10px] text-[#E6A817]">
            <AudioLines className="h-3 w-3" aria-hidden />
            Voice preserved
          </p>
        ) : null}
      </div>
    </div>
  );
}

export const PersonFlowNode = memo(PersonFlowNodeComponent);
