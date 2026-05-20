import type { FamilyPerson } from "@/lib/legacy/types";

/** Dagre `order` — lower = further left (TB) / above (LR). 1 = eldest / first-born. */
export function layoutOrderForPerson(person: FamilyPerson): number {
  if (person.sibling_order != null && person.sibling_order > 0) {
    return person.sibling_order;
  }
  if (person.birth_year != null && Number.isFinite(person.birth_year)) {
    return person.birth_year;
  }
  return 100_000;
}

export function compareSiblingBirthOrder(a: FamilyPerson, b: FamilyPerson): number {
  const diff = layoutOrderForPerson(a) - layoutOrderForPerson(b);
  if (diff !== 0) return diff;
  return a.display_name.localeCompare(b.display_name, undefined, { sensitivity: "base" });
}

/** Same `parent_id` (including both root-level with null parent). */
export function getSiblingsOf(person: FamilyPerson, people: FamilyPerson[]): FamilyPerson[] {
  const parentId = person.parent_id;
  return people.filter(
    (p) => p.id !== person.id && (parentId ? p.parent_id === parentId : !p.parent_id),
  );
}

export function sortSiblings(people: FamilyPerson[]): FamilyPerson[] {
  return [...people].sort(compareSiblingBirthOrder);
}

/** Full sibling set including `person`, sorted eldest → youngest. */
export function sortedSiblingGroup(person: FamilyPerson, people: FamilyPerson[]): FamilyPerson[] {
  return sortSiblings([person, ...getSiblingsOf(person, people)]);
}

export function siblingOrderUpdates(
  orderedIds: string[],
): { personId: string; sibling_order: number }[] {
  return orderedIds.map((personId, index) => ({
    personId,
    sibling_order: index + 1,
  }));
}

export function moveSiblingEarlier(
  personId: string,
  group: FamilyPerson[],
): { personId: string; sibling_order: number }[] | null {
  const ids = group.map((p) => p.id);
  const idx = ids.indexOf(personId);
  if (idx <= 0) return null;
  const next = [...ids];
  [next[idx - 1], next[idx]] = [next[idx]!, next[idx - 1]!];
  return siblingOrderUpdates(next);
}

export function moveSiblingLater(
  personId: string,
  group: FamilyPerson[],
): { personId: string; sibling_order: number }[] | null {
  const ids = group.map((p) => p.id);
  const idx = ids.indexOf(personId);
  if (idx < 0 || idx >= ids.length - 1) return null;
  const next = [...ids];
  [next[idx], next[idx + 1]] = [next[idx + 1]!, next[idx]!];
  return siblingOrderUpdates(next);
}

export function buildLayoutOrderMap(people: FamilyPerson[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const p of people) {
    map.set(p.id, layoutOrderForPerson(p));
  }
  return map;
}
