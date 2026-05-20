import { useCallback, useEffect, useState } from "react";
import type { FamilyPerson, FamilyPersonProfilePatch } from "@/lib/legacy/types";
import { PERSON_RELATION_LABELS } from "@/lib/legacy/personRelationLabels";
import { cn } from "@/lib/utils";

// Every field filled here is a data point.
// Career, gender, birthplace, education, religion, language —
// these are the building blocks of the patterns engine.
//
// When a family has mapped 3+ people with these fields,
// the Patterns tab will surface:
//   "Farming appears across 3 generations"
//   "The women in this circle were all multilingual"
//   "Every paternal line went into trade"
//
// The dataset is being built right now.
// Every input is infrastructure for the reasoning layer.

type ProfileFieldKey = keyof FamilyPersonProfilePatch;

type FieldDef = {
  key: ProfileFieldKey;
  label: string;
  multiline?: boolean;
  type?: "text" | "number" | "select-gender" | "select-relation";
};

const PROFILE_FIELDS: FieldDef[] = [
  { key: "display_name", label: "Name" },
  { key: "gender", label: "Gender", type: "select-gender" },
  { key: "career_path", label: "Career" },
  { key: "relation_label", label: "Relation", type: "select-relation" },
  { key: "birth_year", label: "Birth year", type: "number" },
  { key: "death_year", label: "Death year", type: "number" },
  { key: "birthplace", label: "Birthplace" },
  { key: "education", label: "Education" },
  { key: "languages", label: "Languages" },
  { key: "religion", label: "Religion" },
  { key: "bio", label: "Bio", multiline: true },
];

const FIELD_INPUT_CLASS = cn(
  "w-full rounded border border-transparent bg-transparent px-1 py-0.5 font-manrope text-[13px] font-normal text-white",
  "placeholder:text-[#333333]",
  "hover:border-[#1a1a1a] focus:border-[#2a2a2a] focus:bg-[#0a0a0a] focus:outline-none",
  "cursor-text",
);

function displayValue(person: FamilyPerson, key: ProfileFieldKey): string {
  switch (key) {
    case "display_name":
      return person.display_name;
    case "gender":
      return person.gender === "male" ? "Male" : person.gender === "female" ? "Female" : "";
    case "career_path":
      return person.career_path ?? "";
    case "relation_label":
      return person.relation_label ?? "";
    case "birth_year":
      return person.birth_year != null ? String(person.birth_year) : "";
    case "death_year":
      return person.death_year != null ? String(person.death_year) : "";
    case "birthplace":
      return person.birthplace ?? "";
    case "education":
      return person.education ?? "";
    case "languages":
      return person.languages?.length ? person.languages.join(", ") : "";
    case "religion":
      return person.religion ?? "";
    case "bio":
      return person.bio ?? "";
    case "nickname":
      return person.nickname ?? "";
    default:
      return "";
  }
}

function parseFieldValue(key: ProfileFieldKey, raw: string): FamilyPersonProfilePatch {
  const trimmed = raw.trim();
  switch (key) {
    case "display_name":
      return { display_name: trimmed };
    case "gender":
      if (!trimmed || trimmed === "—") return { gender: null };
      return { gender: trimmed.toLowerCase() === "female" ? "female" : "male" };
    case "career_path":
      return { career_path: trimmed || null };
    case "relation_label":
      return { relation_label: trimmed.toUpperCase() || "FAMILY" };
    case "birth_year":
      return { birth_year: trimmed ? Number.parseInt(trimmed, 10) : null };
    case "death_year":
      return { death_year: trimmed ? Number.parseInt(trimmed, 10) : null };
    case "birthplace":
      return { birthplace: trimmed || null };
    case "education":
      return { education: trimmed || null };
    case "languages":
      return {
        languages: trimmed
          ? trimmed.split(",").map((s) => s.trim()).filter(Boolean)
          : null,
      };
    case "religion":
      return { religion: trimmed || null };
    case "bio":
      return { bio: trimmed || null };
    default:
      return {};
  }
}

function valuesEqual(key: ProfileFieldKey, current: string, patch: FamilyPersonProfilePatch): boolean {
  if (key === "languages") {
    return (patch.languages?.join(", ") ?? "") === current;
  }
  const next = Object.values(patch)[0];
  if (next == null) return current === "";
  return String(next) === current;
}

type ProfileFieldRowProps = {
  field: FieldDef;
  person: FamilyPerson;
  onSave: (personId: string, patch: FamilyPersonProfilePatch) => Promise<void>;
};

function ProfileFieldRow({ field, person, onSave }: ProfileFieldRowProps) {
  const { key, label, multiline, type } = field;
  const serverValue = displayValue(person, key);
  const [draft, setDraft] = useState(serverValue);

  useEffect(() => {
    setDraft(serverValue);
  }, [serverValue, person.id]);

  const commit = useCallback(async () => {
    const patch = parseFieldValue(key, draft);
    if (Object.keys(patch).length === 0) return;
    if (valuesEqual(key, serverValue, patch)) return;
    await onSave(person.id, patch);
  }, [draft, key, onSave, person.id, serverValue]);

  const control =
    type === "select-gender" ? (
      <select
        value={draft || "—"}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        className={cn(FIELD_INPUT_CLASS, "h-7 cursor-pointer")}
        aria-label={label}
      >
        <option value="—">—</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
    ) : type === "select-relation" ? (
      <select
        value={draft || "FAMILY"}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        className={cn(FIELD_INPUT_CLASS, "h-7 cursor-pointer")}
        aria-label={label}
      >
        {PERSON_RELATION_LABELS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    ) : multiline ? (
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        rows={3}
        placeholder="—"
        className={cn(FIELD_INPUT_CLASS, "resize-y min-h-[4.5rem]")}
        aria-label={label}
      />
    ) : (
      <input
        type={type === "number" ? "number" : "text"}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !multiline) {
            e.preventDefault();
            void commit();
            (e.target as HTMLInputElement).blur();
          }
        }}
        placeholder="—"
        className={cn(FIELD_INPUT_CLASS, "h-7")}
        aria-label={label}
      />
    );

  return (
    <div className="flex gap-3">
      <dt className="w-[100px] shrink-0 pt-1 font-manrope text-[10px] font-normal uppercase tracking-[0.1em] text-[#444444]">
        {label}
      </dt>
      <dd className="min-w-0 flex-1">{control}</dd>
    </div>
  );
}

type PersonProfileSectionProps = {
  person: FamilyPerson;
  onSave: (personId: string, patch: FamilyPersonProfilePatch) => Promise<void>;
};

export function PersonProfileSection({ person, onSave }: PersonProfileSectionProps) {
  return (
    <section className="mb-6">
      <p className="mb-3 font-manrope text-[10px] font-normal uppercase tracking-[0.1em] text-[#444444]">
        Profile
      </p>
      <dl className="space-y-2">
        {PROFILE_FIELDS.map((field) => (
          <ProfileFieldRow key={field.key} field={field} person={person} onSave={onSave} />
        ))}
      </dl>
    </section>
  );
}
