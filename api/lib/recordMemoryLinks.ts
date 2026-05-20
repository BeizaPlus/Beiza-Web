import type { SupabaseClient } from "@supabase/supabase-js";

type MemoryAboutBody =
  | { type: "self" }
  | { type: "person"; person_id: string }
  | { type: "new"; name: string };

type PersonRow = {
  id: string;
  user_id: string | null;
  display_name: string;
};

export async function applyMemoryAboutLinks(params: {
  supabase: SupabaseClient;
  circleId: string;
  recordingId: string;
  recordedByUserId: string;
  memoryAbout: MemoryAboutBody;
}) {
  const { supabase, circleId, recordingId, recordedByUserId, memoryAbout } = params;

  const { data: peopleRows, error: peopleError } = await supabase
    .from("family_people")
    .select("id, user_id, display_name")
    .eq("circle_id", circleId);

  if (peopleError) throw peopleError;

  const people = (peopleRows ?? []) as PersonRow[];
  const links: { recording_id: string; person_id: string; link_type: "about" | "by" }[] = [];

  const recorderPerson = people.find((p) => p.user_id === recordedByUserId) ?? null;

  if (memoryAbout.type === "self") {
    const aboutPerson =
      recorderPerson ?? people.find((p) => p.user_id === recordedByUserId) ?? people[0];
    if (aboutPerson) {
      links.push({ recording_id: recordingId, person_id: aboutPerson.id, link_type: "about" });
      links.push({ recording_id: recordingId, person_id: aboutPerson.id, link_type: "by" });
    }
  } else if (memoryAbout.type === "person") {
    const aboutPerson = people.find((p) => p.id === memoryAbout.person_id);
    if (aboutPerson) {
      links.push({ recording_id: recordingId, person_id: aboutPerson.id, link_type: "about" });
    }
    if (recorderPerson) {
      links.push({ recording_id: recordingId, person_id: recorderPerson.id, link_type: "by" });
    }
  } else if (memoryAbout.type === "new") {
    const name = memoryAbout.name.trim();
    if (!name) throw new Error("Name is required for a new person.");
    const { data: created, error: createError } = await supabase
      .from("family_people")
      .insert({
        circle_id: circleId,
        display_name: name,
        status: "invited",
        relation_label: "FAMILY",
        created_by: recordedByUserId,
      })
      .select("id")
      .single();
    if (createError) throw createError;
    links.push({ recording_id: recordingId, person_id: created.id, link_type: "about" });
    if (recorderPerson) {
      links.push({ recording_id: recordingId, person_id: recorderPerson.id, link_type: "by" });
    }
  }

  if (links.length === 0) return;

  const { error: linkError } = await supabase.from("recording_person_links").insert(links);
  if (linkError) throw linkError;
}
