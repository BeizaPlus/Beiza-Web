/** Shape encoding by relation — never hardcode per person id. */

export type PersonNodeVisual = "rounded-rect" | "circle-ancestor" | "circle-child" | "soft-square";

const PERSON_FLOW_TYPES = new Set(["person", "circlePerson", "squarePerson"]);

export function isPersonFlowNodeType(type: string | undefined): boolean {
  return type != null && PERSON_FLOW_TYPES.has(type);
}

const ANCESTOR_RELATIONS = new Set([
  "grandfather",
  "grandmother",
  "great-grandfather",
  "great-grandmother",
  "grandparent",
  "ancestor",
]);

const PARENT_RELATIONS = new Set([
  "father",
  "mother",
  "parent",
  "uncle",
  "aunt",
]);

const CHILD_RELATIONS = new Set([
  "son",
  "daughter",
  "grandson",
  "granddaughter",
  "grandchild",
  "child",
  "nephew",
  "niece",
]);

const SELF_RELATIONS = new Set(["keeper", "self", "me"]);

function normalizeRelation(relation: string) {
  return relation.trim().toLowerCase().replace(/\s+/g, "-");
}

export function getPersonNodeVisual(relation: string): PersonNodeVisual {
  const r = normalizeRelation(relation);

  if (ANCESTOR_RELATIONS.has(r) || (r.includes("grand") && (r.includes("father") || r.includes("mother")))) {
    return "circle-ancestor";
  }
  if (CHILD_RELATIONS.has(r)) {
    return "circle-child";
  }
  if (SELF_RELATIONS.has(r)) {
    return "soft-square";
  }
  if (PARENT_RELATIONS.has(r)) {
    return "rounded-rect";
  }
  return "rounded-rect";
}

export function getFlowNodeType(relation: string): "person" | "circlePerson" | "squarePerson" {
  const visual = getPersonNodeVisual(relation);
  if (visual === "circle-ancestor" || visual === "circle-child") return "circlePerson";
  if (visual === "soft-square") return "squarePerson";
  return "person";
}
