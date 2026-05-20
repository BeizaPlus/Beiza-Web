import { ARC_POSITION_ORDER } from "@/lib/legacy/familyTree";
import type { LegacyRecording } from "@/lib/legacy/types";
import type { ArcPosition, PromptCategory } from "@/lib/prompts";

export const VAULT_CATEGORY_ORDER: PromptCategory[] = [
  "origins",
  "people",
  "place",
  "food",
  "moment",
  "loss",
  "wisdom",
  "legacy",
  "joy",
  "open",
];

export const VAULT_CATEGORY_LABELS: Record<PromptCategory, string> = {
  origins: "Origins & roots",
  people: "People & family",
  place: "Places that shaped us",
  food: "Food & home",
  moment: "Moments worth keeping",
  loss: "Loss & remembrance",
  wisdom: "Wisdom passed down",
  legacy: "What we leave behind",
  joy: "Joy & celebration",
  open: "Open stories",
};

function arcSortKey(arc: string | null | undefined) {
  const i = ARC_POSITION_ORDER.indexOf(arc as ArcPosition);
  return i === -1 ? 99 : i;
}

export function sortRecordingsForNarrative(recordings: LegacyRecording[]) {
  return [...recordings].sort((a, b) => {
    const arcDiff =
      arcSortKey(a.prompt_arc_position) - arcSortKey(b.prompt_arc_position);
    if (arcDiff !== 0) return arcDiff;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

export type VaultCategoryGroup = {
  category: PromptCategory;
  label: string;
  recordings: LegacyRecording[];
};

export function groupVaultRecordingsByCategory(
  recordings: LegacyRecording[],
): VaultCategoryGroup[] {
  const buckets = new Map<PromptCategory, LegacyRecording[]>();

  for (const rec of recordings) {
    const cat = (rec.prompt_category as PromptCategory | null) ?? "open";
    const key = VAULT_CATEGORY_ORDER.includes(cat) ? cat : "open";
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(rec);
  }

  for (const list of buckets.values()) {
    list.sort((a, b) => {
      const arcDiff =
        arcSortKey(a.prompt_arc_position) - arcSortKey(b.prompt_arc_position);
      if (arcDiff !== 0) return arcDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  return VAULT_CATEGORY_ORDER.filter((cat) => buckets.has(cat)).map((category) => ({
    category,
    label: VAULT_CATEGORY_LABELS[category],
    recordings: buckets.get(category)!,
  }));
}
