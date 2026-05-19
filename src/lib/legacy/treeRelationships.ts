export const RELATIONSHIP_TYPES = [
  "parent_of",
  "child_of",
  "sibling_of",
  "spouse_of",
  "grandparent_of",
  "grandchild_of",
  "uncle_aunt_of",
  "nephew_niece_of",
  "friend_of",
  "other",
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const RELATIONSHIP_OPTIONS: { type: RelationshipType; label: string }[] = [
  { type: "parent_of", label: "Parent of" },
  { type: "child_of", label: "Child of" },
  { type: "sibling_of", label: "Sibling of" },
  { type: "spouse_of", label: "Spouse of" },
  { type: "grandparent_of", label: "Grandparent" },
  { type: "grandchild_of", label: "Grandchild" },
  { type: "uncle_aunt_of", label: "Uncle/Aunt" },
  { type: "nephew_niece_of", label: "Nephew/Niece" },
  { type: "friend_of", label: "Friend" },
  { type: "other", label: "Other" },
];

export type TreeEdgeRow = {
  id: string;
  circle_id: string;
  source_person_id: string;
  target_person_id: string;
  relationship_type: RelationshipType;
  created_at: string;
};

export function formatRelationship(type: string): string {
  return RELATIONSHIP_OPTIONS.find((o) => o.type === type)?.label ?? type.replace(/_/g, " ");
}

export const PERSON_EDGE_STYLE = {
  stroke: "rgba(68, 102, 255, 0.5)",
  strokeWidth: 1.5,
} as const;

export const PERSON_EDGE_SELECTED_STYLE = {
  stroke: "#CE1126",
  strokeWidth: 2,
} as const;

export const TREE_DEFAULT_EDGE_OPTIONS = {
  type: "smoothstep" as const,
  style: PERSON_EDGE_STYLE,
};
