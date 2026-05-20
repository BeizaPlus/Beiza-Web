import type { FamilyPerson } from "@/lib/legacy/types";
import type { RelationshipType, TreeEdgeRow } from "@/lib/legacy/treeRelationships";

/** Generation index — lower = older (used for edge label inference). */
export function generationIndex(relationLabel: string | null | undefined): number | null {
  const r = (relationLabel ?? "").toUpperCase().trim();
  if (r.includes("GRANDCHILD") || r.includes("GRANDSON") || r.includes("GRANDDAUGHTER")) {
    return 3;
  }
  if (r === "CHILD" || r === "SON" || r === "DAUGHTER" || (r.includes("CHILD") && !r.includes("GRAND"))) {
    return 2;
  }
  if (r === "GRANDPARENT" || r.includes("GRANDPARENT") || r.includes("GRANDFATHER") || r.includes("GRANDMOTHER")) {
    return 0;
  }
  if (r === "PARENT" || r.includes("PARENT") || r === "FATHER" || r === "MOTHER") return 1;
  return null;
}

/**
 * Infer edge type from each person's relation label (source → target).
 * Returns null when generation labels are too ambiguous (same-gen friends, etc.).
 */
export function suggestedRelationshipBetween(
  sourceLabel: string | null | undefined,
  targetLabel: string | null | undefined,
): RelationshipType | null {
  const sourceGen = generationIndex(sourceLabel);
  const targetGen = generationIndex(targetLabel);
  if (sourceGen == null || targetGen == null) return null;

  const gap = targetGen - sourceGen;

  if (gap === 1) return "parent_of";
  if (gap >= 2) return "grandparent_of";
  if (gap === -1) return "child_of";
  if (gap <= -2) return "grandchild_of";
  if (gap === 0) return "sibling_of";
  return null;
}

/** Step relationship up/down one generation on an edge when a person's label changes. */
export function shiftRelationshipOneGeneration(
  type: RelationshipType,
  role: "source" | "target",
  younger: boolean,
): RelationshipType | null {
  if (younger) {
    if (role === "target") {
      if (type === "parent_of") return "grandparent_of";
      if (type === "grandparent_of") return "parent_of";
    }
    if (role === "source") {
      if (type === "child_of") return "grandchild_of";
      if (type === "grandchild_of") return "child_of";
    }
    return null;
  }

  if (role === "target") {
    if (type === "grandparent_of") return "parent_of";
    if (type === "parent_of") return "grandparent_of";
  }
  if (role === "source") {
    if (type === "grandchild_of") return "child_of";
    if (type === "child_of") return "grandchild_of";
  }
  return null;
}

export function planEdgeUpdatesForRelationChange(
  personId: string,
  newRelationLabel: string,
  edges: TreeEdgeRow[],
  people: FamilyPerson[],
): { edgeId: string; relationship_type: RelationshipType }[] {
  const peopleById = new Map(people.map((p) => [p.id, p]));
  const person = peopleById.get(personId);
  if (!person) return [];

  const oldGen = generationIndex(person.relation_label);
  const newGen = generationIndex(newRelationLabel);
  const updates: { edgeId: string; relationship_type: RelationshipType }[] = [];

  for (const edge of edges) {
    if (edge.source_person_id !== personId && edge.target_person_id !== personId) continue;

    const source =
      edge.source_person_id === personId
        ? { ...peopleById.get(edge.source_person_id)!, relation_label: newRelationLabel }
        : peopleById.get(edge.source_person_id);
    const target =
      edge.target_person_id === personId
        ? { ...peopleById.get(edge.target_person_id)!, relation_label: newRelationLabel }
        : peopleById.get(edge.target_person_id);
    if (!source || !target) continue;

    let nextType: RelationshipType | null = suggestedRelationshipBetween(
      source.relation_label,
      target.relation_label,
    );

    if (
      !nextType &&
      oldGen != null &&
      newGen != null &&
      oldGen !== newGen
    ) {
      const younger = newGen > oldGen;
      const role: "source" | "target" =
        edge.source_person_id === personId ? "source" : "target";
      nextType = shiftRelationshipOneGeneration(edge.relationship_type, role, younger);
    }

    if (nextType && nextType !== edge.relationship_type) {
      updates.push({ edgeId: edge.id, relationship_type: nextType });
    }
  }

  return updates;
}
