import { supabase } from "@/lib/supabaseClient";
import { getStoredCircleToken } from "@/lib/circleAccess";
import type { FamilyPerson, FamilyPersonGender } from "@/lib/legacy/types";
import type { RelationshipType, TreeEdgeRow } from "@/lib/legacy/treeRelationships";

const PHOTO_BUCKET = "family-people-photos";

export async function fetchTreeEdges(
  circleId: string,
  useApi = false,
): Promise<TreeEdgeRow[]> {
  if (useApi) {
    const token = getStoredCircleToken(circleId);
    if (!token) return [];
    const res = await fetch(
      `/api/circle/tree-data?circle_id=${encodeURIComponent(circleId)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) return [];
    const body = (await res.json()) as { treeEdges?: TreeEdgeRow[] };
    return body.treeEdges ?? [];
  }

  if (!supabase) return [];
  const { data, error } = await supabase
    .from("tree_edges")
    .select("*")
    .eq("circle_id", circleId);
  if (error) {
    if (error.message.includes("tree_edges")) return [];
    throw error;
  }
  return (data ?? []) as TreeEdgeRow[];
}

export async function saveTreeEdge(params: {
  circleId: string;
  sourcePersonId: string;
  targetPersonId: string;
  relationshipType: RelationshipType;
  useApi?: boolean;
}): Promise<TreeEdgeRow> {
  const { circleId, sourcePersonId, targetPersonId, relationshipType, useApi } = params;

  if (useApi) {
    const token = getStoredCircleToken(circleId);
    if (!token) throw new Error("Session expired.");
    const res = await fetch("/api/circle/tree-edge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        circle_id: circleId,
        source_person_id: sourcePersonId,
        target_person_id: targetPersonId,
        relationship_type: relationshipType,
      }),
    });
    const body = (await res.json()) as { edge?: TreeEdgeRow; error?: string };
    if (!res.ok) throw new Error(body.error ?? "Could not save connection.");
    return body.edge!;
  }

  if (!supabase) throw new Error("Not connected.");
  const { data, error } = await supabase
    .from("tree_edges")
    .insert({
      circle_id: circleId,
      source_person_id: sourcePersonId,
      target_person_id: targetPersonId,
      relationship_type: relationshipType,
    })
    .select()
    .single();
  if (error) throw error;
  return data as TreeEdgeRow;
}

export async function savePersonCanvasPosition(params: {
  circleId: string;
  personId: string;
  x: number;
  y: number;
  useApi?: boolean;
}): Promise<void> {
  const { circleId, personId, x, y, useApi } = params;

  if (useApi) {
    const token = getStoredCircleToken(circleId);
    if (!token) return;
    await fetch("/api/circle/tree-position", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        circle_id: circleId,
        person_id: personId,
        canvas_x: x,
        canvas_y: y,
      }),
    });
    return;
  }

  if (!supabase) return;
  await supabase
    .from("family_people")
    .update({ canvas_x: x, canvas_y: y })
    .eq("id", personId)
    .eq("circle_id", circleId);
}

/** Remove every tree edge attached to a person (as source or target). */
export async function deleteTreeEdgesForPerson(params: {
  personId: string;
  circleId: string;
  edges: TreeEdgeRow[];
  useApi?: boolean;
}): Promise<string[]> {
  const { personId, circleId, edges, useApi } = params;
  const toRemove = edges.filter(
    (row) => row.source_person_id === personId || row.target_person_id === personId,
  );
  const removedIds: string[] = [];
  for (const row of toRemove) {
    await deleteTreeEdge({ edgeId: row.id, circleId, useApi });
    removedIds.push(row.id);
  }
  return removedIds;
}

export async function deleteTreeEdge(params: {
  edgeId: string;
  circleId: string;
  useApi?: boolean;
}): Promise<void> {
  const { edgeId, circleId, useApi } = params;

  if (useApi) {
    const token = getStoredCircleToken(circleId);
    if (!token) throw new Error("Session expired.");
    const res = await fetch(
      `/api/circle/tree-edge?edge_id=${encodeURIComponent(edgeId)}&circle_id=${encodeURIComponent(circleId)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Could not remove connection.");
    return;
  }

  if (!supabase) throw new Error("Not connected.");
  const { error } = await supabase.from("tree_edges").delete().eq("id", edgeId).eq("circle_id", circleId);
  if (error) throw error;
}

export type PersonProfilePatch = {
  displayName?: string;
  relationLabel?: string;
  gender?: FamilyPersonGender | null;
  careerPath?: string | null;
};

export async function savePersonProfile(params: {
  circleId: string;
  personId: string;
  useApi?: boolean;
} & PersonProfilePatch): Promise<FamilyPerson | void> {
  const { circleId, personId, displayName, relationLabel, gender, careerPath, useApi } = params;

  const payload: Record<string, unknown> = {
    circle_id: circleId,
    person_id: personId,
  };
  if (displayName !== undefined) payload.display_name = displayName;
  if (relationLabel !== undefined) payload.relation_label = relationLabel;
  if (gender !== undefined) payload.gender = gender;
  if (careerPath !== undefined) payload.career_path = careerPath;

  if (useApi) {
    const token = getStoredCircleToken(circleId);
    if (!token) throw new Error("Session expired.");
    const res = await fetch("/api/circle/tree-person", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      person?: FamilyPerson;
    };
    if (!res.ok) throw new Error(body.error ?? "Could not update person.");
    return body.person;
  }

  if (!supabase) throw new Error("Not connected.");
  const update: Record<string, string | null> = {};
  if (displayName !== undefined) update.display_name = displayName;
  if (relationLabel !== undefined) update.relation_label = relationLabel;
  if (gender !== undefined) update.gender = gender;
  if (careerPath !== undefined) update.career_path = careerPath;

  const { data, error } = await supabase
    .from("family_people")
    .update(update)
    .eq("id", personId)
    .eq("circle_id", circleId)
    .select("*")
    .single();
  if (error) throw error;
  return data as FamilyPerson;
}

/** Upload portrait and persist photo_url in one request (no follow-up PATCH). */
export async function savePersonPhoto(params: {
  circleId: string;
  personId: string;
  file: File;
  useApi?: boolean;
}): Promise<string> {
  const { circleId, personId, file, useApi } = params;

  if (useApi) {
    const token = getStoredCircleToken(circleId);
    if (!token) throw new Error("Session expired.");
    const dataBase64 = await fileToBase64(file);
    const res = await fetch("/api/circle/tree-person-photo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        circle_id: circleId,
        person_id: personId,
        content_type: file.type || "image/jpeg",
        data_base64: dataBase64,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string; photo_url?: string };
    if (!res.ok || !body.photo_url) {
      throw new Error(body.error ?? "Could not upload photo.");
    }
    return body.photo_url;
  }

  if (!supabase) throw new Error("Not connected.");
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const objectPath = `${circleId}/${personId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(objectPath, file, { upsert: true });
  if (uploadError) throw uploadError;

  const base = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
  const photoUrl = `${base}/storage/v1/object/public/${PHOTO_BUCKET}/${objectPath}`;

  const { error: updateError } = await supabase
    .from("family_people")
    .update({ photo_url: photoUrl })
    .eq("id", personId)
    .eq("circle_id", circleId);
  if (updateError) throw updateError;
  return photoUrl;
}

export async function duplicateFamilyPerson(params: {
  circleId: string;
  personId: string;
  canvasX: number;
  canvasY: number;
  useApi?: boolean;
}): Promise<FamilyPerson> {
  const { circleId, personId, canvasX, canvasY, useApi } = params;

  if (useApi) {
    const token = getStoredCircleToken(circleId);
    if (!token) throw new Error("Session expired.");
    const res = await fetch("/api/circle/tree-person-duplicate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        circle_id: circleId,
        person_id: personId,
        canvas_x: canvasX,
        canvas_y: canvasY,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      person?: FamilyPerson;
    };
    if (!res.ok || !body.person) {
      throw new Error(body.error ?? "Could not duplicate person.");
    }
    return body.person;
  }

  if (!supabase) throw new Error("Not connected.");
  const { data: source, error: fetchError } = await supabase
    .from("family_people")
    .select("*")
    .eq("id", personId)
    .eq("circle_id", circleId)
    .maybeSingle();
  if (fetchError || !source) throw new Error("Person not found.");

  const row = source as FamilyPerson;
  const { data: created, error: insertError } = await supabase
    .from("family_people")
    .insert({
      circle_id: circleId,
      display_name: row.display_name,
      relation_label: row.relation_label,
      status: row.status,
      gender: row.gender ?? null,
      career_path: row.career_path ?? null,
      photo_url: row.photo_url ?? null,
      canvas_x: canvasX,
      canvas_y: canvasY,
    })
    .select("*")
    .single();
  if (insertError) throw insertError;
  return created as FamilyPerson;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1]! : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}
