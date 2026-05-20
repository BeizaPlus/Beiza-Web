import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import type { HealthConditionCategory, PersonHealthCondition } from "@/lib/legacy/types";
import {
  deletePersonHealthCondition,
  fetchPersonHealth,
  upsertPersonHealthCondition,
} from "@/lib/legacy/personHealthApi";
import { cn } from "@/lib/utils";

const CATEGORIES: { id: HealthConditionCategory; label: string }[] = [
  { id: "cardiovascular", label: "Heart & blood pressure" },
  { id: "metabolic", label: "Metabolic" },
  { id: "neurological", label: "Neurological" },
  { id: "mental_health", label: "Mental health" },
  { id: "cancer", label: "Cancer" },
  { id: "autoimmune", label: "Autoimmune" },
  { id: "respiratory", label: "Respiratory" },
  { id: "musculoskeletal", label: "Bones & joints" },
  { id: "hereditary", label: "Hereditary" },
  { id: "addiction", label: "Addiction" },
  { id: "other", label: "Other" },
];

type PersonHealthSectionProps = {
  circleId: string;
  personId: string;
  editable: boolean;
  initial?: PersonHealthCondition[];
  onChange?: (conditions: PersonHealthCondition[]) => void;
};

export function PersonHealthSection({
  circleId,
  personId,
  editable,
  initial = [],
  onChange,
}: PersonHealthSectionProps) {
  const [conditions, setConditions] = useState<PersonHealthCondition[]>(
    initial.filter((c) => c.person_id === personId),
  );
  const [loading, setLoading] = useState(!initial.length);
  const [draft, setDraft] = useState("");
  const [category, setCategory] = useState<HealthConditionCategory>("other");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial.length) {
      setConditions(initial.filter((c) => c.person_id === personId));
      return;
    }
    setLoading(true);
    void fetchPersonHealth(circleId, personId)
      .then((rows) => {
        setConditions(rows);
        onChange?.(rows);
      })
      .catch(() => setConditions([]))
      .finally(() => setLoading(false));
  }, [circleId, personId, initial, onChange]);

  const addCondition = useCallback(async () => {
    const text = draft.trim();
    if (!text || !editable) return;
    setSaving(true);
    try {
      const row = await upsertPersonHealthCondition(circleId, {
        person_id: personId,
        category,
        condition: text,
      });
      const next = [...conditions.filter((c) => c.id !== row.id), row];
      setConditions(next);
      onChange?.(next);
      setDraft("");
    } finally {
      setSaving(false);
    }
  }, [circleId, personId, category, draft, conditions, editable, onChange]);

  const remove = async (id: string) => {
    if (!editable) return;
    await deletePersonHealthCondition(circleId, id);
    const next = conditions.filter((c) => c.id !== id);
    setConditions(next);
    onChange?.(next);
  };

  if (loading) {
    return (
      <p className="flex items-center gap-2 font-manrope text-[13px] text-[#444444]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading health notes…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="font-manrope text-[12px] leading-relaxed text-[#666666]">
        Medical history only — separate from personality traits. Weekly questions fill this over
        years without a medical intake form.
      </p>

      <ul className="space-y-2">
        {conditions.map((c) => (
          <li
            key={c.id}
            className="flex items-start justify-between gap-2 rounded-lg border border-[#1e1e1e] bg-[#111111] px-3 py-2"
          >
            <div>
              <p className="font-manrope text-[13px] text-white">{c.condition}</p>
              <p className="font-manrope text-[10px] uppercase tracking-wider text-[#555555]">
                {c.category.replace(/_/g, " ")}
              </p>
            </div>
            {editable ? (
              <button
                type="button"
                onClick={() => void remove(c.id)}
                className="text-[#666666] hover:text-[#E6A817]"
                aria-label="Remove condition"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {editable ? (
        <div className="space-y-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as HealthConditionCategory)}
            className="w-full rounded-lg border border-[#2a2a2a] bg-[#111111] px-3 py-2 font-manrope text-[12px] text-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. Hypertension, diagnosed at 52"
              className="flex-1 rounded-lg border border-[#2a2a2a] bg-[#111111] px-3 py-2 font-manrope text-[13px] text-white placeholder:text-[#444444]"
              onKeyDown={(e) => {
                if (e.key === "Enter") void addCondition();
              }}
            />
            <button
              type="button"
              disabled={saving || !draft.trim()}
              onClick={() => void addCondition()}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg border border-[#E6A817]/40 bg-[#1e1800] text-[#E6A817]",
                "disabled:opacity-40",
              )}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
