import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AudioLines } from "lucide-react";
import type { PersonNodeData } from "@/lib/legacy/familyTreeFlow";
import { cn } from "@/lib/utils";
import { PersonNodeEditMenu } from "@/components/legacy/family-tree/flow/PersonNodeEditMenu";

const HANDLE_CLASS = "family-tree-handle !h-[12px] !w-[12px] !border-2 !border-[#0a0a0a] !bg-[#E6A817]";

const SIDE_HANDLES: {
  position: Position;
  targetId: string;
  sourceId: string;
  style: React.CSSProperties;
}[] = [
  { position: Position.Left, targetId: "left", sourceId: "left-s", style: { left: -6 } },
  { position: Position.Right, targetId: "right-t", sourceId: "right", style: { right: -6 } },
  { position: Position.Top, targetId: "top", sourceId: "top-s", style: { top: -6 } },
  { position: Position.Bottom, targetId: "bottom-t", sourceId: "bottom", style: { bottom: -6 } },
];

function PersonFlowNodeComponent({ data }: NodeProps & { data: PersonNodeData }) {
  const [imgError, setImgError] = useState(false);
  const isGone = data.status === "gone";
  const isLiving = data.status === "living";
  const showPhoto = Boolean(data.photoUrl) && !imgError;

  return (
    <div className="family-tree-person-node relative w-[180px]">
      {SIDE_HANDLES.map(({ position, targetId, style }) => (
        <Handle
          key={targetId}
          id={targetId}
          type="target"
          position={position}
          className={HANDLE_CLASS}
          style={style}
          isConnectable
        />
      ))}
      {SIDE_HANDLES.map(({ position, sourceId, style }) => (
        <Handle
          key={sourceId}
          id={sourceId}
          type="source"
          position={position}
          className={HANDLE_CLASS}
          style={style}
          isConnectable
        />
      ))}

      <div
        className={cn(
          "relative z-0 cursor-pointer overflow-hidden rounded-[10px] bg-[#111111] text-left",
          isLiving && "family-tree-person-living border border-[#E6A817]",
          isGone && "border border-[#2a2a2a]",
          data.status === "invited" && "border border-dashed border-[#2a2a2a]",
          data.selected && "ring-2 ring-primary/50",
        )}
      >
        {data.selected && data.canEdit && data.onEditPerson ? (
          <PersonNodeEditMenu
            personId={data.personId}
            name={data.name}
            relation={data.relation}
            onSave={data.onEditPerson}
          />
        ) : null}

        <div className="relative h-[100px] w-full overflow-hidden">
          {data.gender === "male" ? (
            <span
              className="absolute left-2 top-2 z-10 h-2.5 w-2.5 rounded-full bg-[#4466ff] ring-2 ring-[#0a0a0a]"
              title="Male"
              aria-hidden
            />
          ) : null}
          {data.gender === "female" ? (
            <span
              className="absolute left-2 top-2 z-10 h-2.5 w-2.5 rounded-full bg-[#CE1126] ring-2 ring-[#0a0a0a]"
              title="Female"
              aria-hidden
            />
          ) : null}
          {showPhoto ? (
            <img
              src={data.photoUrl!}
              alt=""
              onError={() => setImgError(true)}
              className={cn("h-full w-full object-cover", isGone && "grayscale")}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: "linear-gradient(160deg, #1a1200, #0a0a0a)" }}
            >
              <span className="text-[32px] font-medium text-[#E6A817] opacity-50">
                {data.initials || data.name?.slice(0, 2).toUpperCase()}
              </span>
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
          {data.careerPath ? (
            <p className="truncate font-manrope text-[10px] font-normal italic text-[#888888]">
              {data.careerPath}
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
    </div>
  );
}

export const PersonFlowNode = memo(PersonFlowNodeComponent);
