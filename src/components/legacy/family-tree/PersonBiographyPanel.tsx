import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Loader2, MapPin, X } from "lucide-react";
import { LegacyPlaybackRow } from "@/components/legacy/LegacyPlaybackRow";
import type {
  FamilyPerson,
  FamilyPersonGender,
  FamilyPersonProfilePatch,
  LegacyRecording,
  PersonBiographyFragment,
  RecordingPersonLink,
} from "@/lib/legacy/types";
import { sortBiographyFragments } from "@/lib/legacy/familyTree";
import { PERSON_RELATION_LABELS } from "@/lib/legacy/personRelationLabels";
import { getStoredCircleToken } from "@/lib/circleAccess";
import { dispatchBeizaTreeUpdated } from "@/lib/legacy/personaEvents";
import { SiblingOrderSection } from "@/components/legacy/family-tree/SiblingOrderSection";
import { savePersonPhoto } from "@/lib/legacy/treeCanvasPersistence";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

// Every field filled here is a data point — patterns engine infrastructure.

type MemoriesState = "loading" | "loaded" | "empty" | "error";

type PersonTraits = {
  known_for: string[];
  physical_traits: string[];
  personality_traits: string[];
  gift_traits: string[];
};

const TRAITS_STORAGE_KEY = "beiza_person_traits_v1";

type PersonBiographyPanelProps = {
  person: FamilyPerson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  circlePeople?: FamilyPerson[];
  onProfileSave?: (personId: string, patch: FamilyPersonProfilePatch) => Promise<void>;
  onSiblingOrdersSave?: (
    updates: { personId: string; sibling_order: number }[],
  ) => Promise<void>;
  onSetTreeLeader?: (personId: string) => Promise<void>;
};

const FIELD_INPUT_CLASS =
  "tree-field-input w-full rounded-lg border border-[#2a2a2a] bg-[#111111] px-3 py-2.5 font-manrope text-[13px] text-white outline-none transition-colors placeholder:text-[#444444] focus:border-[#E6A817]";

const SECTION_LABEL_CLASS =
  "font-manrope text-[10px] font-normal uppercase tracking-[0.2em] text-[#333333]";

function loadTraits(personId: string): PersonTraits {
  if (typeof window === "undefined") {
    return { known_for: [], physical_traits: [], personality_traits: [], gift_traits: [] };
  }
  try {
    const raw = localStorage.getItem(`${TRAITS_STORAGE_KEY}_${personId}`);
    if (!raw) return { known_for: [], physical_traits: [], personality_traits: [], gift_traits: [] };
    return JSON.parse(raw) as PersonTraits;
  } catch {
    return { known_for: [], physical_traits: [], personality_traits: [], gift_traits: [] };
  }
}

function saveTraits(personId: string, traits: PersonTraits) {
  localStorage.setItem(`${TRAITS_STORAGE_KEY}_${personId}`, JSON.stringify(traits));
}

function parseYearFromText(value: string): number | null {
  const match = value.trim().match(/\b(1[89]\d{2}|20\d{2})\b/);
  if (!match) return null;
  const year = Number.parseInt(match[0], 10);
  return Number.isFinite(year) ? year : null;
}

function buildFragmentsFromTreePayload(
  personId: string,
  recordings: LegacyRecording[],
  links: RecordingPersonLink[],
  people: FamilyPerson[],
): PersonBiographyFragment[] {
  const recById = new Map(recordings.map((r) => [r.id, r]));
  const personByUserId = new Map(
    people.filter((p) => p.user_id).map((p) => [p.user_id as string, p]),
  );

  const fragments: PersonBiographyFragment[] = [];
  for (const link of links) {
    if (link.person_id !== personId) continue;
    const rec = recById.get(link.recording_id);
    if (!rec) continue;
    const recorder = personByUserId.get(rec.recorded_by);
    fragments.push({
      recording_id: rec.id,
      audio_url: rec.audio_url,
      prompt_text: rec.prompt || rec.title || "Memory",
      prompt_category: rec.prompt_category ?? null,
      arc_position: rec.prompt_arc_position ?? null,
      title: rec.title,
      recorded_at: rec.created_at,
      link_type: link.link_type,
      recorded_by: {
        name: recorder?.display_name ?? "Family member",
        relation: recorder?.relation_label ?? null,
      },
    });
  }
  return sortBiographyFragments(fragments);
}

async function fetchMemoriesViaTreeData(
  circleId: string,
  personId: string,
): Promise<PersonBiographyFragment[]> {
  const token = getStoredCircleToken(circleId);
  if (!token) throw new Error("Session expired");

  const res = await fetch(
    `/api/circle/tree-data?circle_id=${encodeURIComponent(circleId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error("Could not load memories");

  const body = (await res.json()) as {
    recordings?: LegacyRecording[];
    links?: RecordingPersonLink[];
    people?: FamilyPerson[];
  };

  return buildFragmentsFromTreePayload(
    personId,
    body.recordings ?? [],
    body.links ?? [],
    body.people ?? [],
  );
}

async function fetchMemoriesViaSupabase(personId: string): Promise<PersonBiographyFragment[]> {
  if (!supabase) throw new Error("Supabase unavailable");

  const rpcPromise = supabase.rpc("get_person_biography", { p_person_id: personId });
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("timeout")), 3500);
  });

  const { data, error } = await Promise.race([rpcPromise, timeoutPromise]);
  if (error) throw error;
  return sortBiographyFragments((data ?? []) as PersonBiographyFragment[]);
}

function usePanelMemories(person: FamilyPerson | null, useApi: boolean) {
  const [memoriesState, setMemoriesState] = useState<MemoriesState>("loading");
  const [fragments, setFragments] = useState<PersonBiographyFragment[]>([]);

  useEffect(() => {
    if (!person?.id) {
      setFragments([]);
      setMemoriesState("empty");
      return;
    }

    let cancelled = false;
    setMemoriesState("loading");
    setFragments([]);

    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setMemoriesState((prev) => (prev === "loading" ? "empty" : prev));
      }
    }, 4000);

    const load = async () => {
      try {
        let loaded: PersonBiographyFragment[] = [];

        if (useApi) {
          loaded = await fetchMemoriesViaTreeData(person.circle_id, person.id);
        } else if (supabase) {
          try {
            loaded = await fetchMemoriesViaSupabase(person.id);
          } catch {
            loaded = [];
          }
        }

        if (cancelled) return;
        setFragments(loaded);
        setMemoriesState(loaded.length > 0 ? "loaded" : "empty");
      } catch {
        if (!cancelled) {
          setFragments([]);
          setMemoriesState("error");
        }
      } finally {
        window.clearTimeout(timeout);
      }
    };

    void load();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [person?.id, person?.circle_id, useApi]);

  return { fragments, memoriesState };
}

function TagInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim().replace(/,$/, "");
    if (!trimmed || value.includes(trimmed)) {
      setInput("");
      return;
    }
    onChange([...value, trimmed]);
    setInput("");
  };

  return (
    <div
      className={cn(
        "flex min-h-10 flex-wrap gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#111111] px-2.5 py-2",
        disabled && "opacity-60",
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1.5 rounded-full border border-[#3a2800] bg-[#0e0c00] px-2.5 py-0.5 font-manrope text-[11px] text-[#E6A817]"
        >
          {tag}
          {!disabled ? (
            <button
              type="button"
              className="text-[#555555] hover:text-white"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          ) : null}
        </span>
      ))}
      {!disabled ? (
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            }
          }}
          onBlur={addTag}
          placeholder={value.length === 0 ? placeholder : "+"}
          className="min-w-[60px] flex-1 border-none bg-transparent font-manrope text-xs text-white outline-none placeholder:text-[#444444]"
        />
      ) : null}
    </div>
  );
}

function ProfileField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1 block font-manrope text-[10px] font-normal uppercase tracking-[0.1em] text-[#444444]">
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
  <>
      <div className="mt-6 border-t border-[#1a1a1a] pt-6" />
      <p className={cn(SECTION_LABEL_CLASS, "mb-3")}>{title}</p>
    </>
  );
}

function PanelShell({
  editable,
  localPerson,
  savedFlash,
  onClose,
  onSaveField,
  onPhotoPick,
  onSetTreeLeader,
  traits,
  onTraitsChange,
  traitsOpen,
  onTraitsOpenChange,
  fragments,
  memoriesState,
  fragmentsRef,
  circleId,
  recordHref,
  circlePeople,
  onSiblingOrdersSave,
}: {
  editable: boolean;
  localPerson: FamilyPerson;
  savedFlash: boolean;
  onClose: () => void;
  onSaveField: (patch: FamilyPersonProfilePatch) => Promise<void>;
  onPhotoPick: (file: File) => void;
  onSetTreeLeader?: (personId: string) => Promise<void>;
  traits: PersonTraits;
  onTraitsChange: (traits: PersonTraits) => void;
  traitsOpen: boolean;
  onTraitsOpenChange: (open: boolean) => void;
  fragments: PersonBiographyFragment[];
  memoriesState: MemoriesState;
  fragmentsRef: RefObject<HTMLDivElement | null>;
  circleId: string;
  recordHref: string;
  circlePeople: FamilyPerson[];
  onSiblingOrdersSave?: (
    updates: { personId: string; sibling_order: number }[],
  ) => Promise<void>;
}) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [nameDraft, setNameDraft] = useState(localPerson.display_name);
  const [birthDraft, setBirthDraft] = useState(
    localPerson.birth_year != null ? String(localPerson.birth_year) : "",
  );

  useEffect(() => {
    setNameDraft(localPerson.display_name);
    setBirthDraft(localPerson.birth_year != null ? String(localPerson.birth_year) : "");
  }, [localPerson.id, localPerson.display_name, localPerson.birth_year]);

  const genderValue = localPerson.gender ?? "";

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0a0a0a]">
      <div className="relative shrink-0 px-5 pb-4 pt-5">
        <button
          type="button"
          className="absolute right-4 top-4 text-[#666666] hover:text-white"
          onClick={onClose}
          aria-label="Close panel"
        >
          <X className="h-5 w-5" />
        </button>

        {savedFlash ? (
          <p className="absolute left-5 top-4 font-manrope text-[10px] text-[#E6A817]">Saved</p>
        ) : null}

        <div className="flex flex-col items-center pr-8 pt-2">
          <button
            type="button"
            disabled={!editable}
            onClick={() => editable && photoInputRef.current?.click()}
            className={cn(
              "relative h-[60px] w-[60px] overflow-hidden rounded-full border border-[#E6A817]/50 bg-[#1e1800]",
              editable && "cursor-pointer hover:border-[#E6A817]",
            )}
            aria-label="Upload photo"
          >
            {localPerson.photo_url ? (
              <img
                src={localPerson.photo_url}
                alt=""
                className="h-full w-full object-cover object-[center_top]"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-manrope text-lg font-semibold text-[#E6A817]">
                {localPerson.display_name
                  .split(/\s+/)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            )}
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onPhotoPick(file);
              e.target.value = "";
            }}
          />

          {editable ? (
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={() => {
                const trimmed = nameDraft.trim();
                if (trimmed && trimmed !== localPerson.display_name) {
                  void onSaveField({ display_name: trimmed });
                }
              }}
              className="mt-3 w-full border-none bg-transparent text-center font-manrope text-xl font-medium text-white outline-none focus:ring-0"
            />
          ) : (
            <p className="mt-3 text-center font-manrope text-xl font-medium text-white">
              {localPerson.display_name}
            </p>
          )}

          {editable ? (
            <select
              value={localPerson.relation_label ?? "FAMILY"}
              onChange={(e) => void onSaveField({ relation_label: e.target.value })}
              className="mt-2 rounded-full border border-[#2a2a2a] bg-[#111111] px-3 py-1 font-manrope text-[10px] uppercase tracking-wider text-[#E6A817] outline-none focus:border-[#E6A817]"
            >
              {PERSON_RELATION_LABELS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          ) : localPerson.relation_label ? (
            <span className="mt-2 rounded-full border border-[#2a2a2a] px-3 py-1 font-manrope text-[10px] uppercase tracking-wider text-[#E6A817]">
              {localPerson.relation_label}
            </span>
          ) : null}

          {onSetTreeLeader ? (
            <button
              type="button"
              onClick={() => void onSetTreeLeader(localPerson.id)}
              className={cn(
                "mt-3 flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-manrope text-[10px] uppercase tracking-wider transition",
                localPerson.is_tree_anchor
                  ? "border-[#3a2800] bg-[#0e0c00] text-[#E6A817]"
                  : "border-[#2a2a2a] text-[#888888] hover:border-[#E6A817]/40 hover:text-[#E6A817]",
              )}
            >
              <MapPin className="h-3 w-3" aria-hidden />
              {localPerson.is_tree_anchor ? "Family leader" : "Pin as family leader"}
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-10">
        <SectionHeader title="Identity" />

        <ProfileField label="Full name">
          <input
            type="text"
            disabled={!editable}
            defaultValue={localPerson.display_name}
            key={`name-${localPerson.id}-${localPerson.display_name}`}
            placeholder="Full name"
            className={FIELD_INPUT_CLASS}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== localPerson.display_name) void onSaveField({ display_name: v });
            }}
          />
        </ProfileField>

        <ProfileField label="Nickname">
          <input
            type="text"
            disabled={!editable}
            defaultValue={localPerson.nickname ?? ""}
            key={`nick-${localPerson.id}`}
            placeholder="What they were called"
            className={FIELD_INPUT_CLASS}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== (localPerson.nickname ?? "")) void onSaveField({ nickname: v || null });
            }}
          />
        </ProfileField>

        <ProfileField label="Gender">
          <div className="flex flex-wrap gap-2">
            {(["male", "female", "other"] as const).map((g) => {
              const active =
                g === "other"
                  ? !genderValue
                  : genderValue === g;
              return (
                <button
                  key={g}
                  type="button"
                  disabled={!editable}
                  onClick={() =>
                    void onSaveField({
                      gender: g === "other" ? null : (g as FamilyPersonGender),
                    })
                  }
                  className={cn(
                    "rounded-full px-3 py-1.5 font-manrope text-[11px] capitalize",
                    active
                      ? "border border-[#E6A817]/40 bg-[#1e1800] text-[#E6A817]"
                      : "border border-[#2a2a2a] bg-[#111111] text-[#888888]",
                  )}
                >
                  {g === "other" ? "Other" : g}
                </button>
              );
            })}
          </div>
        </ProfileField>

        <ProfileField label="Date of birth">
          <input
            type="text"
            disabled={!editable}
            value={birthDraft}
            onChange={(e) => setBirthDraft(e.target.value)}
            placeholder="e.g. 1942 or March 12, 1942"
            className={FIELD_INPUT_CLASS}
            onBlur={() => {
              const year = parseYearFromText(birthDraft);
              if (year !== localPerson.birth_year) {
                void onSaveField({ birth_year: year });
              }
            }}
          />
        </ProfileField>

        {onSiblingOrdersSave ? (
          <SiblingOrderSection
            person={localPerson}
            circlePeople={circlePeople}
            editable={editable}
            onReorder={onSiblingOrdersSave}
          />
        ) : null}

        <ProfileField label="Year of death">
          <input
            type="text"
            disabled={!editable}
            defaultValue={localPerson.death_year != null ? String(localPerson.death_year) : ""}
            key={`death-${localPerson.id}`}
            placeholder="Optional"
            className={FIELD_INPUT_CLASS}
            onBlur={(e) => {
              const raw = e.target.value.trim();
              const year = raw ? parseYearFromText(raw) ?? Number.parseInt(raw, 10) : null;
              const parsed = year != null && Number.isFinite(year) ? year : null;
              if (parsed !== localPerson.death_year) {
                void onSaveField({ death_year: parsed });
              }
            }}
          />
        </ProfileField>

        <ProfileField label="Birthplace">
          <input
            type="text"
            disabled={!editable}
            defaultValue={localPerson.birthplace ?? ""}
            key={`bp-${localPerson.id}`}
            placeholder="Kumasi, Ghana"
            className={FIELD_INPUT_CLASS}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== (localPerson.birthplace ?? "")) void onSaveField({ birthplace: v || null });
            }}
          />
        </ProfileField>

        <SectionHeader title="Life" />

        <ProfileField label="Career / occupation">
          <input
            type="text"
            disabled={!editable}
            defaultValue={localPerson.career_path ?? ""}
            key={`career-${localPerson.id}`}
            placeholder="e.g. Farmer, Teacher, Trader"
            className={FIELD_INPUT_CLASS}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== (localPerson.career_path ?? "")) void onSaveField({ career_path: v || null });
            }}
          />
        </ProfileField>

        <ProfileField label="Education">
          <input
            type="text"
            disabled={!editable}
            defaultValue={localPerson.education ?? ""}
            key={`edu-${localPerson.id}`}
            placeholder="School, training, apprenticeship"
            className={FIELD_INPUT_CLASS}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== (localPerson.education ?? "")) void onSaveField({ education: v || null });
            }}
          />
        </ProfileField>

        <ProfileField label="Religion / faith">
          <input
            type="text"
            disabled={!editable}
            defaultValue={localPerson.religion ?? ""}
            key={`rel-${localPerson.id}`}
            placeholder="Faith tradition"
            className={FIELD_INPUT_CLASS}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== (localPerson.religion ?? "")) void onSaveField({ religion: v || null });
            }}
          />
        </ProfileField>

        <ProfileField label="Languages spoken">
          <TagInput
            value={localPerson.languages ?? []}
            onChange={(tags) => void onSaveField({ languages: tags.length ? tags : null })}
            placeholder="Type a language, press Enter"
            disabled={!editable}
          />
        </ProfileField>

        <ProfileField label="Known for">
          <TagInput
            value={traits.known_for}
            onChange={(tags) => onTraitsChange({ ...traits, known_for: tags })}
            placeholder="e.g. Storytelling, farming"
            disabled={!editable}
          />
        </ProfileField>

        <SectionHeader title="About" />

        <ProfileField label="Bio">
          <textarea
            disabled={!editable}
            defaultValue={localPerson.bio ?? ""}
            key={`bio-${localPerson.id}`}
            rows={4}
            placeholder={`Write something about ${localPerson.display_name} in your own words.`}
            className={cn(FIELD_INPUT_CLASS, "resize-y min-h-[6rem]")}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== (localPerson.bio ?? "")) void onSaveField({ bio: v || null });
            }}
          />
        </ProfileField>

        <button
          type="button"
          className="mb-2 flex w-full items-center justify-between py-1"
          onClick={() => onTraitsOpenChange(!traitsOpen)}
        >
          <span className={SECTION_LABEL_CLASS}>Traits</span>
          {traitsOpen ? (
            <ChevronUp className="h-4 w-4 text-[#444444]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#444444]" />
          )}
        </button>

        {traitsOpen ? (
          <div className="space-y-3 pb-2">
            <ProfileField label="Physical">
              <TagInput
                value={traits.physical_traits}
                onChange={(tags) => onTraitsChange({ ...traits, physical_traits: tags })}
                placeholder="tall, broad, etc."
                disabled={!editable}
              />
            </ProfileField>
            <ProfileField label="Personality">
              <TagInput
                value={traits.personality_traits}
                onChange={(tags) => onTraitsChange({ ...traits, personality_traits: tags })}
                placeholder="quiet, funny, etc."
                disabled={!editable}
              />
            </ProfileField>
            <ProfileField label="Gifts">
              <TagInput
                value={traits.gift_traits}
                onChange={(tags) => onTraitsChange({ ...traits, gift_traits: tags })}
                placeholder="music, cooking, etc."
                disabled={!editable}
              />
            </ProfileField>
          </div>
        ) : null}

        <SectionHeader title="Their story" />

        <div ref={fragmentsRef}>
          {memoriesState === "loading" ? (
            <p className="flex items-center gap-2 font-manrope text-[13px] text-[#444444]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Gathering memories…
            </p>
          ) : memoriesState === "empty" || memoriesState === "error" ? (
            <div className="space-y-2">
              <p className="font-manrope text-[13px] text-[#444444]">
                No recordings linked to {localPerson.display_name} yet.
              </p>
              <Link
                to={recordHref}
                className="inline-block font-manrope text-[13px] text-[#E6A817] hover:underline"
              >
                + Record a memory about them →
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {fragments.map((fragment) => (
                <li
                  key={`${fragment.recording_id}-${fragment.link_type}`}
                  className="rounded-lg border border-[#1e1e1e] bg-[#111111] p-3"
                >
                  <p className="text-xs italic text-[#555555]">{fragment.prompt_text}</p>
                  {fragment.audio_url ? (
                    <div className="mt-2">
                      <LegacyPlaybackRow recordedUri={fragment.audio_url} durationSeconds={0} />
                    </div>
                  ) : null}
                  <p className="mt-2 font-manrope text-[10px] text-[#444444]">
                    Recorded by {fragment.recorded_by.name}
                    {fragment.arc_position ? ` · ${fragment.arc_position}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <SectionHeader title="Photos" />

        <div className="grid grid-cols-3 gap-2">
          {localPerson.photo_url ? (
            <div className="aspect-square overflow-hidden rounded-lg border border-[#2a2a2a]">
              <img src={localPerson.photo_url} alt="" className="h-full w-full object-cover" />
            </div>
          ) : null}
          {editable ? (
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-[#2a2a2a] font-manrope text-[11px] text-[#666666] hover:border-[#E6A817]/40 hover:text-[#E6A817]"
            >
              + Add photo
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function PersonBiographyPanel({
  person,
  open,
  onOpenChange,
  circlePeople = [],
  onProfileSave,
  onSiblingOrdersSave,
  onSetTreeLeader,
}: PersonBiographyPanelProps) {
  const editable = Boolean(onProfileSave);
  const useApi = editable;
  const fragmentsRef = useRef<HTMLDivElement>(null);

  const { fragments, memoriesState } = usePanelMemories(person, useApi);

  const [localPerson, setLocalPerson] = useState<FamilyPerson | null>(person);
  const [savedFlash, setSavedFlash] = useState(false);
  const [traitsOpen, setTraitsOpen] = useState(false);
  const [traits, setTraits] = useState<PersonTraits>({
    known_for: [],
    physical_traits: [],
    personality_traits: [],
    gift_traits: [],
  });

  useEffect(() => {
    if (person) {
      setLocalPerson(person);
      setTraits(loadTraits(person.id));
    }
  }, [person]);

  const flashSaved = useCallback(() => {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1000);
  }, []);

  const onSaveField = useCallback(
    async (patch: FamilyPersonProfilePatch) => {
      if (!localPerson || !onProfileSave) return;
      await onProfileSave(localPerson.id, patch);
      setLocalPerson((prev) => (prev ? { ...prev, ...patch } : prev));
      flashSaved();
    },
    [localPerson, onProfileSave, flashSaved],
  );

  const onTraitsChange = useCallback(
    (next: PersonTraits) => {
      if (!localPerson) return;
      setTraits(next);
      saveTraits(localPerson.id, next);
      flashSaved();
    },
    [localPerson, flashSaved],
  );

  const onPhotoPick = useCallback(
    async (file: File) => {
      if (!localPerson || !editable) return;
      try {
        const photoUrl = await savePersonPhoto({
          circleId: localPerson.circle_id,
          personId: localPerson.id,
          file,
          useApi: true,
        });
        setLocalPerson((prev) => (prev ? { ...prev, photo_url: photoUrl } : prev));
        dispatchBeizaTreeUpdated(localPerson.circle_id);
        flashSaved();
      } catch {
        /* ignore */
      }
    },
    [localPerson, editable, flashSaved],
  );

  if (!person || !localPerson) return null;

  const panel = (
    <PanelShell
      editable={editable}
      localPerson={localPerson}
      savedFlash={savedFlash}
      onClose={() => onOpenChange(false)}
      onSaveField={onSaveField}
      onPhotoPick={onPhotoPick}
      onSetTreeLeader={onSetTreeLeader}
      traits={traits}
      onTraitsChange={onTraitsChange}
      traitsOpen={traitsOpen}
      onTraitsOpenChange={setTraitsOpen}
      fragments={fragments}
      memoriesState={memoriesState}
      fragmentsRef={fragmentsRef}
      circleId={localPerson.circle_id}
      recordHref={useApi ? `/circle/${localPerson.circle_id}/record` : "/legacy/record"}
      circlePeople={circlePeople}
      onSiblingOrdersSave={onSiblingOrdersSave}
    />
  );

  return (
    <>
      {open ? (
        <aside className="tree-panel fixed inset-y-0 right-0 z-50 hidden h-screen w-full max-w-md border-l border-[#1e1e1e] bg-[#0a0a0a] shadow-2xl md:block">
          {panel}
        </aside>
      ) : null}

      {open ? (
        <aside className="tree-panel fixed inset-0 z-50 flex flex-col bg-[#0a0a0a] md:hidden">
          {panel}
        </aside>
      ) : null}
    </>
  );
}
