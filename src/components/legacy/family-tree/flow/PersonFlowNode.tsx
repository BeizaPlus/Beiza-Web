import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { PersonNodeData } from "@/lib/legacy/familyTreeFlow";
import { PersonNodeCore } from "@/components/legacy/family-tree/flow/PersonNodeCore";

function PersonFlowNodeComponent(props: NodeProps & { data: PersonNodeData }) {
  return <PersonNodeCore {...props} visual="rounded-rect" />;
}

export const PersonFlowNode = memo(PersonFlowNodeComponent);
