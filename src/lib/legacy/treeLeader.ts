import type { FamilyPerson } from "@/lib/legacy/types";
import { countMemoriesForPerson } from "@/lib/legacy/familyTree";

/** How the app chose who leads the tree layout for this circle. */
export type TreeLeaderReason =
  | "pinned"
  | "keeper"
  | "most_memories"
  | "memorial"
  | "first_member";

export type TreeLeaderResolution = {
  personId: string;
  displayName: string;
  reason: TreeLeaderReason;
  /** Short UI label, e.g. "Pinned leader" */
  reasonLabel: string;
  isExplicitPin: boolean;
};

const REASON_LABELS: Record<TreeLeaderReason, string> = {
  pinned: "Pinned leader",
  keeper: "Circle keeper",
  most_memories: "Most linked memories",
  memorial: "In memoriam anchor",
  first_member: "Default anchor",
};

function normalizeRelation(relation: string | null | undefined) {
  return (relation ?? "").trim().toUpperCase();
}

/** Person marked as keeper / self on the tree (matches soft-square node role). */
export function isKeeperRelation(relation: string | null | undefined) {
  const r = normalizeRelation(relation);
  return r === "KEEPER" || r === "SELF" || r === "ME";
}

/**
 * Determines the family leader for a circle — who the tree organizes around.
 *
 * Priority (first match wins):
 * 1. Explicit pin — `is_tree_anchor` on family_people (right-click or side panel)
 * 2. Keeper — relation KEEPER / SELF / ME on a person node
 * 3. Most memories — person with the most recording links
 * 4. Memorial — first person with status "gone"
 * 5. First member — earliest created person on the tree
 */
export function resolveTreeLeader(
  people: FamilyPerson[],
  links: { person_id: string }[],
): TreeLeaderResolution | null {
  if (people.length === 0) return null;

  const aboutCounts = new Map(
    people.map((p) => [p.id, countMemoriesForPerson(p.id, links)]),
  );

  const pinned = people.find((p) => p.is_tree_anchor);
  if (pinned) {
    return {
      personId: pinned.id,
      displayName: pinned.display_name,
      reason: "pinned",
      reasonLabel: REASON_LABELS.pinned,
      isExplicitPin: true,
    };
  }

  const keeper = people.find((p) => isKeeperRelation(p.relation_label));
  if (keeper) {
    return {
      personId: keeper.id,
      displayName: keeper.display_name,
      reason: "keeper",
      reasonLabel: REASON_LABELS.keeper,
      isExplicitPin: false,
    };
  }

  let bestId: string | null = null;
  let bestCount = -1;
  for (const p of people) {
    const c = aboutCounts.get(p.id) ?? 0;
    if (c > bestCount) {
      bestCount = c;
      bestId = p.id;
    }
  }
  if (bestId && bestCount > 0) {
    const person = people.find((p) => p.id === bestId)!;
    return {
      personId: bestId,
      displayName: person.display_name,
      reason: "most_memories",
      reasonLabel: REASON_LABELS.most_memories,
      isExplicitPin: false,
    };
  }

  const gone = people.find((p) => p.status === "gone");
  if (gone) {
    return {
      personId: gone.id,
      displayName: gone.display_name,
      reason: "memorial",
      reasonLabel: REASON_LABELS.memorial,
      isExplicitPin: false,
    };
  }

  const byCreated = [...people].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const first = byCreated[0]!;
  return {
    personId: first.id,
    displayName: first.display_name,
    reason: "first_member",
    reasonLabel: REASON_LABELS.first_member,
    isExplicitPin: false,
  };
}

/** Leader id only — use {@link resolveTreeLeader} when you need the reason. */
export function resolveTreeLeaderId(
  people: FamilyPerson[],
  links: { person_id: string }[],
): string | null {
  return resolveTreeLeader(people, links)?.personId ?? null;
}
