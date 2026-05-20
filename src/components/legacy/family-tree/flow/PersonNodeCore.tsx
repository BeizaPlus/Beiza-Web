import { memo, useEffect, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AudioLines, MapPin } from "lucide-react";
import { BeizaCircleMark } from "@/components/family-trees/BeizaCircleMark";
import type { PersonNodeData } from "@/lib/legacy/familyTreeFlow";
import type { PersonNodeVisual } from "@/lib/legacy/personNodeShapes";
import { cn } from "@/lib/utils";
import { PersonNodeEditMenu } from "@/components/legacy/family-tree/flow/PersonNodeEditMenu";

import { getPersonCardMetrics } from "@/lib/legacy/personNodeMetrics";

const HANDLE_CLASS = "family-tree-handle";

const BORDER_HANDLES: { id: string; position: Position }[] = [
  { id: "left", position: Position.Left },
  { id: "right", position: Position.Right },
  { id: "top", position: Position.Top },
  { id: "bottom", position: Position.Bottom },
];

function CardBorderHandles() {
  return (
    <>
      {BORDER_HANDLES.map(({ id, position }) => (
        <Handle
          key={id}
          id={id}
          type="source"
          position={position}
          isConnectableStart
          isConnectableEnd
          className={HANDLE_CLASS}
        />
      ))}
    </>
  );
}

function truncateCareer(career: string) {
  const t = career.trim();
  if (t.length <= 20) return t;
  return `${t.slice(0, 20)}…`;
}

type PersonNodeCoreProps = NodeProps & {
  data: PersonNodeData;
  visual: PersonNodeVisual;
};

function PersonNodeCoreComponent({ data, visual }: PersonNodeCoreProps) {
  const [imgError, setImgError] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(data.name);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const isGone = data.status === "gone";
  const isLiving = data.status === "living";
  const showPhoto = Boolean(data.photoUrl) && !imgError;
  const canRename = Boolean(data.canEdit && data.onEditPerson);
  const isCircle = visual === "circle-ancestor" || visual === "circle-child";
  const isAncestor = visual === "circle-ancestor";
  const isSoftSquare = visual === "soft-square";
  const circleSize = isAncestor ? 140 : 100;
  const cardWidth = isCircle ? circleSize : isSoftSquare ? 160 : 180;
  const cardMetrics = getPersonCardMetrics(visual);

  const subtitle = data.careerPath
    ? truncateCareer(data.careerPath)
    : data.relation || null;

  useEffect(() => {
    setNameDraft(data.name);
  }, [data.name]);

  useEffect(() => {
    if (editingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [editingName]);

  const commitName = () => {
    const trimmed = nameDraft.trim();
    setEditingName(false);
    if (!trimmed || !data.onEditPerson) return;
    if (trimmed !== data.name) {
      data.onEditPerson(data.personId, trimmed, data.relation || "FAMILY");
    }
  };

  const startNameEdit = (e: React.MouseEvent) => {
    if (!canRename) return;
    e.stopPropagation();
    e.preventDefault();
    setNameDraft(data.name);
    setEditingName(true);
  };

  const photoArea = (
    <>
      {data.gender === "male" ? (
        <span
          className="absolute left-2 top-2 z-10 h-2.5 w-2.5 rounded-full bg-[#E6A817] ring-2 ring-[#0a0a0a]"
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
          className={cn("h-full w-full object-cover object-[center_top]", isGone && "grayscale")}
        />
      ) : (
        <div
          className="tree-node-placeholder flex h-full w-full items-center justify-center"
          style={{ background: "linear-gradient(160deg, #1a1200, #0a0a0a)" }}
        >
          {isCircle ? (
            <span
              className="font-manrope font-medium text-[#E6A817] opacity-50"
              style={{ fontSize: isAncestor ? 28 : 22 }}
            >
              {data.initials}
            </span>
          ) : (
            <BeizaCircleMark size={48} className="opacity-90" />
          )}
        </div>
      )}
    </>
  );

  const nameBlock = (
    <div
      className={cn(
        isCircle ? "mt-2 px-2 text-center" : "space-y-0.5 px-3 py-2.5",
        canRename && !editingName && !isCircle && "cursor-text",
      )}
      onClick={!isCircle && canRename && !editingName ? startNameEdit : undefined}
    >
      {editingName && !isCircle ? (
        <input
          ref={nameInputRef}
          type="text"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitName();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              setNameDraft(data.name);
              setEditingName(false);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="nodrag nopan w-full rounded border border-[#E6A817]/50 bg-[#0a0a0a] px-1 py-0.5 font-manrope text-[13px] font-medium text-white outline-none"
          aria-label="Person name"
        />
      ) : (
        <p
          className={cn(
            "tree-node-name nodrag nopan truncate font-manrope text-[13px] font-medium text-white",
            isCircle && "text-[12px]",
            canRename && "cursor-text",
          )}
          title={canRename ? "Click to rename" : undefined}
          onClick={isCircle && canRename && !editingName ? startNameEdit : undefined}
        >
          {data.name}
        </p>
      )}
      {subtitle ? (
        <p
          className={cn(
            "tree-node-subtitle font-manrope text-[10px] font-normal text-[#555555]",
            isCircle && "mt-0.5",
            data.careerPath && "truncate",
          )}
        >
          {subtitle}
        </p>
      ) : null}
      {!isCircle && data.memoryCount > 0 ? (
        <p className="font-manrope text-[10px] text-[#E6A817]">
          {data.memoryCount} {data.memoryCount === 1 ? "memory" : "memories"}
        </p>
      ) : null}
      {!isCircle && isGone && data.memoryCount > 0 ? (
        <p className="flex items-center gap-1 font-manrope text-[10px] text-[#E6A817]">
          <AudioLines className="h-3 w-3" aria-hidden />
          Voice preserved
        </p>
      ) : null}
    </div>
  );

  return (
    <div
      className="family-tree-person-node relative flex flex-col items-center"
      style={{ width: cardWidth }}
    >
      {data.isTreeLeader ? (
        <span
          className="absolute -top-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-[#3a2800] bg-[#0e0c00] px-2 py-0.5 font-manrope text-[9px] font-medium uppercase tracking-wider text-[#E6A817]"
          title="Family leader — tree organizes around this person"
        >
          <MapPin className="h-2.5 w-2.5" aria-hidden />
          Leader
        </span>
      ) : null}

      {data.selected && data.canEdit && data.onEditPerson ? (
        <PersonNodeEditMenu
          personId={data.personId}
          name={data.name}
          relation={data.relation}
          onSave={data.onEditPerson}
        />
      ) : null}

      {isCircle ? (
        <>
          <div
            className="family-tree-handle-anchor relative shrink-0"
            style={{ width: cardMetrics.width, height: cardMetrics.height }}
          >
            <CardBorderHandles />
            <div
              className={cn(
                "h-full w-full overflow-hidden",
                isGone ? "border-[#2a2a2a]" : "border-[#E6A817]",
                isAncestor ? "border-[1.5px]" : "border",
              )}
              style={{ borderRadius: "50%" }}
            >
              {photoArea}
            </div>
          </div>
          {nameBlock}
        </>
      ) : (
        <div
          className="family-tree-handle-anchor relative"
          style={{ width: cardMetrics.width, height: cardMetrics.height }}
        >
          <CardBorderHandles />
          <div
            className={cn(
              "tree-node-surface relative z-0 flex h-full w-full cursor-pointer flex-col overflow-hidden bg-[#111111] text-left",
              isSoftSquare ? "rounded-2xl" : "rounded-[10px]",
              isLiving && "family-tree-person-living border border-[#E6A817]",
              isGone && "border border-[#2a2a2a]",
              data.status === "invited" && "border border-dashed border-[#2a2a2a]",
              data.selected && "ring-2 ring-primary/50",
              isSoftSquare && isLiving && "family-tree-person-keeper-pulse",
            )}
          >
            <div className={cn("relative w-full shrink-0 overflow-hidden", isSoftSquare ? "h-[120px]" : "h-[100px]")}>
              {photoArea}
            </div>
            <div className="min-h-0 flex-1">{nameBlock}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export const PersonNodeCore = memo(PersonNodeCoreComponent);
