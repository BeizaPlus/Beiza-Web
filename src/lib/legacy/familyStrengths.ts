import type { FamilyPerson } from "@/lib/legacy/types";

/** Tag buckets used in PersonBiographyPanel + person_traits DB. */
export type PersonTraitBuckets = {
  known_for: string[];
  physical_traits: string[];
  personality_traits: string[];
  gift_traits: string[];
};

export type PersonTraitRow = {
  id: string;
  person_id: string;
  category: string;
  trait: string;
};

export type StrengthAxisKey =
  | "storytelling"
  | "craft"
  | "character"
  | "presence"
  | "legacy";

export type StrengthAxis = {
  key: StrengthAxisKey;
  label: string;
  shortLabel: string;
  hint: string;
  value: number;
  potential: number;
};

export type FamilyStrengthProfile = {
  axes: StrengthAxis[];
  topStrengths: string[];
  guidance: string;
  completeness: number;
};

const STORAGE_KEY = "beiza_person_strength_overrides_v1";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function tagScore(tags: string[]): number {
  if (tags.length === 0) return 1.2;
  return clamp(1.2 + tags.length * 1.55, 1.2, 9.8);
}

function profileDepthScore(person: FamilyPerson): number {
  let score = 1;
  if (person.career_path?.trim()) score += 1.2;
  if (person.education?.trim()) score += 1;
  if (person.bio && person.bio.trim().length > 40) score += 1.8;
  if (person.bio && person.bio.trim().length > 120) score += 1;
  if ((person.languages?.length ?? 0) > 0) score += 0.8;
  if (person.religion?.trim()) score += 0.6;
  return clamp(score, 1, 4.5);
}

export function traitsFromDbRows(rows: PersonTraitRow[]): PersonTraitBuckets {
  const buckets: PersonTraitBuckets = {
    known_for: [],
    physical_traits: [],
    personality_traits: [],
    gift_traits: [],
  };
  for (const row of rows) {
    const trait = row.trait.trim();
    if (!trait) continue;
    switch (row.category) {
      case "physical":
        buckets.physical_traits.push(trait);
        break;
      case "personality":
        buckets.personality_traits.push(trait);
        break;
      case "skills":
        buckets.gift_traits.push(trait);
        break;
      case "known_for":
        buckets.known_for.push(trait);
        break;
      default:
        break;
    }
  }
  return buckets;
}

export function mergeTraitBuckets(
  local: PersonTraitBuckets,
  dbRows?: PersonTraitRow[],
): PersonTraitBuckets {
  if (!dbRows?.length) return local;
  const db = traitsFromDbRows(dbRows);
  const uniq = (a: string[], b: string[]) =>
    [...new Set([...a, ...b].map((t) => t.trim()).filter(Boolean))];
  return {
    known_for: uniq(local.known_for, db.known_for),
    physical_traits: uniq(local.physical_traits, db.physical_traits),
    personality_traits: uniq(local.personality_traits, db.personality_traits),
    gift_traits: uniq(local.gift_traits, db.gift_traits),
  };
}

function loadOverrides(personId: string): Partial<Record<StrengthAxisKey, number>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${personId}`);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Record<StrengthAxisKey, number>>;
  } catch {
    return {};
  }
}

export function saveStrengthOverrides(
  personId: string,
  overrides: Partial<Record<StrengthAxisKey, number>>,
) {
  localStorage.setItem(`${STORAGE_KEY}_${personId}`, JSON.stringify(overrides));
}

export function computeFamilyStrengths(
  person: FamilyPerson,
  traits: PersonTraitBuckets,
  memoryCount = 0,
): FamilyStrengthProfile {
  const memoryBoost = clamp(1.5 + memoryCount * 1.1, 1.5, 10);
  const depth = profileDepthScore(person);

  const raw: Record<StrengthAxisKey, number> = {
    storytelling: clamp(tagScore(traits.known_for) * 0.45 + memoryBoost * 0.55, 1, 10),
    craft: tagScore(traits.gift_traits),
    character: tagScore(traits.personality_traits),
    presence: tagScore(traits.physical_traits),
    legacy: clamp(tagScore(traits.known_for) * 0.35 + depth * 1.35, 1, 10),
  };

  const overrides = loadOverrides(person.id);
  for (const key of Object.keys(raw) as StrengthAxisKey[]) {
    if (typeof overrides[key] === "number") {
      raw[key] = clamp(overrides[key]!, 0, 10);
    }
  }

  const axes: StrengthAxis[] = [
    {
      key: "storytelling",
      label: "Story & voice",
      shortLabel: "Story",
      hint: "Memories recorded and stories they are known for",
      value: raw.storytelling,
      potential: 10,
    },
    {
      key: "craft",
      label: "Craft & gifts",
      shortLabel: "Craft",
      hint: "Skills, trades, and talents passed down",
      value: raw.craft,
      potential: 10,
    },
    {
      key: "character",
      label: "Character",
      shortLabel: "Character",
      hint: "Personality traits the family recognizes",
      value: raw.character,
      potential: 10,
    },
    {
      key: "presence",
      label: "Presence",
      shortLabel: "Presence",
      hint: "How they showed up — physical and bearing",
      value: raw.presence,
      potential: 10,
    },
    {
      key: "legacy",
      label: "Legacy depth",
      shortLabel: "Legacy",
      hint: "Career, education, bio, and what they are known for",
      value: raw.legacy,
      potential: 10,
    },
  ];

  const sorted = [...axes].sort((a, b) => b.value - a.value);
  const topStrengths = sorted.slice(0, 2).map((a) => a.label);

  const tagTotal =
    traits.known_for.length +
    traits.physical_traits.length +
    traits.personality_traits.length +
    traits.gift_traits.length;
  const completeness = clamp(
    Math.round((tagTotal / 12) * 55 + (memoryCount > 0 ? 25 : 0) + depth * 5),
    8,
    100,
  );

  const guidance =
    completeness < 35
      ? "Add traits and a memory so the next generation sees a clear map — not guesswork."
      : topStrengths.length >= 2
        ? `Lean into ${topStrengths[0]} and ${topStrengths[1]} — double down instead of chasing what is not in the bloodline.`
        : "Keep recording — strengths sharpen as more of the story is captured.";

  return { axes, topStrengths, guidance, completeness };
}

export function formatStrengthValue(value: number): string {
  return value.toFixed(2);
}
