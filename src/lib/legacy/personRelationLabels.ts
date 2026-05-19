export const PERSON_RELATION_LABELS = [
  "KEEPER",
  "FAMILY",
  "PARENT",
  "CHILD",
  "SIBLING",
  "SPOUSE",
  "GRANDPARENT",
  "GRANDCHILD",
  "COUSIN",
  "FRIEND",
  "OTHER",
] as const;

export type PersonRelationLabel = (typeof PERSON_RELATION_LABELS)[number];
