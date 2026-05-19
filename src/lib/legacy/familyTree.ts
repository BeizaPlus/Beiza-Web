// The family tree is a living document.
// It is not filled in manually — it builds itself from recordings.
//
// Each prompt answer is a fragment of someone's story.
// Each fragment is tagged to a person and a position in their life arc.
//
// The gone node already has a biography — assembled from the memories
// of everyone who loved them and recorded about them.
//
// The tree grows backwards (retrospective) and forwards (active).
// This is the product. Everything else is infrastructure.

import type { ArcPosition } from "@/lib/prompts";
import type { FamilyPerson, FamilyPersonStatus, PersonBiographyFragment } from "@/lib/legacy/types";
import type { RawNodeDatum } from "react-d3-tree";

export const ARC_POSITION_ORDER: ArcPosition[] = [
  "prologue",
  "childhood",
  "becoming",
  "present",
  "reflection",
  "transmission",
  "elegy",
];

export type TreeNodeAttributes = {
  personId: string;
  status: FamilyPersonStatus;
  initials: string;
  memoryCount: string;
  relationLabel: string;
};

export function personInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function countMemoriesForPerson(
  personId: string,
  links: { person_id: string }[],
) {
  return links.filter((l) => l.person_id === personId).length;
}

/** Pick tree root: manual anchor → most memories about → first gone → first person */
export function resolveTreeAnchor(
  people: FamilyPerson[],
  aboutCounts: Map<string, number>,
): string | null {
  if (people.length === 0) return null;

  const anchor = people.find((p) => p.is_tree_anchor);
  if (anchor) return anchor.id;

  let bestId: string | null = null;
  let bestCount = -1;
  for (const p of people) {
    const c = aboutCounts.get(p.id) ?? 0;
    if (c > bestCount) {
      bestCount = c;
      bestId = p.id;
    }
  }
  if (bestId && bestCount > 0) return bestId;

  const gone = people.find((p) => p.status === "gone");
  if (gone) return gone.id;

  return people[0]?.id ?? null;
}

export function buildTreeData(
  people: FamilyPerson[],
  anchorId: string | null,
  memoryCounts: Map<string, number>,
): RawNodeDatum {
  if (people.length === 0) {
    return { name: "Your family", attributes: { personId: "", status: "invited", initials: "?", memoryCount: "0", relationLabel: "" } };
  }

  const byParent = new Map<string | null, FamilyPerson[]>();
  for (const person of people) {
    const key = person.parent_id ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(person);
  }

  const toNode = (person: FamilyPerson): RawNodeDatum => {
    const kids = byParent.get(person.id) ?? [];
    const count = memoryCounts.get(person.id) ?? 0;
    return {
      name: person.display_name,
      attributes: {
        personId: person.id,
        status: person.status,
        initials: personInitials(person.display_name),
        memoryCount: String(count),
        relationLabel: person.relation_label ?? "",
      } satisfies TreeNodeAttributes as unknown as Record<string, string>,
      children: kids.length > 0 ? kids.map(toNode) : undefined,
    };
  };

  const anchor = anchorId ? people.find((p) => p.id === anchorId) : null;
  if (!anchor) {
    const roots = byParent.get(null) ?? people;
    return {
      name: "Family",
      attributes: { personId: "", status: "living", initials: "F", memoryCount: "0", relationLabel: "" },
      children: roots.map(toNode),
    };
  }

  const root = toNode(anchor);
  const orphans = people.filter(
    (p) => p.id !== anchor.id && !p.parent_id && !(byParent.get(null)?.includes(p)),
  );
  const unattached = people.filter(
    (p) =>
      p.id !== anchor.id &&
      p.parent_id !== anchor.id &&
      !(byParent.get(anchor.id)?.some((c) => c.id === p.id)) &&
      !people.some((x) => x.parent_id === p.id && walkUp(x, anchor.id, people)),
  );

  const extra = [...new Set([...orphans, ...unattached])].filter((p) => p.id !== anchor.id);
  if (extra.length > 0) {
    root.children = [...(root.children ?? []), ...extra.map(toNode)];
  }

  return root;
}

function walkUp(person: FamilyPerson, targetId: string, all: FamilyPerson[]): boolean {
  if (person.id === targetId) return true;
  if (!person.parent_id) return false;
  const parent = all.find((p) => p.id === person.parent_id);
  return parent ? walkUp(parent, targetId, all) : false;
}

export function sortBiographyFragments(fragments: PersonBiographyFragment[]) {
  return [...fragments].sort((a, b) => {
    const ai = ARC_POSITION_ORDER.indexOf(a.arc_position as ArcPosition);
    const bi = ARC_POSITION_ORDER.indexOf(b.arc_position as ArcPosition);
    const aKey = ai === -1 ? 99 : ai;
    const bKey = bi === -1 ? 99 : bi;
    if (aKey !== bKey) return aKey - bKey;
    return new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime();
  });
}

// TODO: pass biography fragments to /api/synthesize-biography
// to generate a coherent narrative using Claude API
// Gate behind Heritage tier
