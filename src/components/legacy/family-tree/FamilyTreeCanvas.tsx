import { useMemo, useState } from "react";
import Tree from "react-d3-tree";
import type { FamilyPerson } from "@/lib/legacy/types";
import {
  buildTreeData,
  countMemoriesForPerson,
  resolveTreeAnchor,
  type TreeNodeAttributes,
} from "@/lib/legacy/familyTree";
import { FamilyTreeNodeCard } from "@/components/legacy/family-tree/FamilyTreeNodeCard";
import type { RecordingPersonLink } from "@/lib/legacy/types";

type FamilyTreeCanvasProps = {
  people: FamilyPerson[];
  links: RecordingPersonLink[];
  selectedPersonId: string | null;
  onSelectPerson: (personId: string) => void;
  className?: string;
};

export function FamilyTreeCanvas({
  people,
  links,
  selectedPersonId,
  onSelectPerson,
  className,
}: FamilyTreeCanvasProps) {
  const [translate, setTranslate] = useState({ x: 0, y: 80 });

  const aboutCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const link of links) {
      if (link.link_type === "about") {
        map.set(link.person_id, (map.get(link.person_id) ?? 0) + 1);
      }
    }
    return map;
  }, [links]);

  const memoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const person of people) {
      map.set(person.id, countMemoriesForPerson(person.id, links));
    }
    return map;
  }, [people, links]);

  const treeData = useMemo(() => {
    const anchorId = resolveTreeAnchor(people, aboutCounts);
    return buildTreeData(people, anchorId, memoryCounts);
  }, [people, aboutCounts, memoryCounts]);

  return (
    <div
      className={className}
      style={{ width: "100%", height: "min(520px, 70vh)", background: "#0a0a0a" }}
      ref={(node) => {
        if (node) {
          const { width } = node.getBoundingClientRect();
          setTranslate({ x: width / 2, y: 80 });
        }
      }}
    >
      <Tree
        data={treeData}
        orientation="vertical"
        translate={translate}
        pathFunc="curved"
        separation={{ siblings: 1.1, nonSiblings: 1.4 }}
        nodeSize={{ x: 180, y: 120 }}
        zoomable
        draggable
        renderCustomNodeElement={({ nodeDatum, toggleNode }) => {
          const attrs = nodeDatum.attributes as unknown as TreeNodeAttributes | undefined;
          const personId = attrs?.personId;
          if (!personId) {
            return (
              <g>
                <foreignObject width={120} height={80} x={-60} y={-40}>
                  <div className="flex h-full items-center justify-center text-xs text-[#555555]">
                    {nodeDatum.name}
                  </div>
                </foreignObject>
              </g>
            );
          }

          return (
            <g onClick={toggleNode}>
              <foreignObject width={120} height={80} x={-60} y={-40}>
                <FamilyTreeNodeCard
                  name={nodeDatum.name}
                  initials={attrs.initials}
                  status={attrs.status}
                  memoryCount={Number(attrs.memoryCount) || 0}
                  selected={selectedPersonId === personId}
                  onClick={() => onSelectPerson(personId)}
                />
              </foreignObject>
            </g>
          );
        }}
        styles={{
          links: { stroke: "#1e1e1e", strokeWidth: 1 },
        }}
      />
    </div>
  );
}
