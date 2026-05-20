import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { PersonNodeData } from "@/lib/legacy/familyTreeFlow";
import { getPersonNodeVisual } from "@/lib/legacy/personNodeShapes";
import { PersonNodeCore } from "@/components/legacy/family-tree/flow/PersonNodeCore";

function CirclePersonFlowNodeComponent(props: NodeProps & { data: PersonNodeData }) {
  const visual = getPersonNodeVisual(props.data.relation);
  return (
    <PersonNodeCore
      {...props}
      visual={visual === "circle-child" ? "circle-child" : "circle-ancestor"}
    />
  );
}

export const CirclePersonFlowNode = memo(CirclePersonFlowNodeComponent);
