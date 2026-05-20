import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { PersonNodeData } from "@/lib/legacy/familyTreeFlow";
import { PersonNodeCore } from "@/components/legacy/family-tree/flow/PersonNodeCore";

function SquarePersonFlowNodeComponent(props: NodeProps & { data: PersonNodeData }) {
  return <PersonNodeCore {...props} visual="soft-square" />;
}

export const SquarePersonFlowNode = memo(SquarePersonFlowNodeComponent);
