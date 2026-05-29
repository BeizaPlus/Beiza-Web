import { supabase } from "@/lib/supabaseClient";
import { getStoredCircleToken } from "@/lib/circleAccess";
import { isLegacyStudioPreview } from "@/lib/layoutStudio";
import type { FamilyPerson, FamilyPersonGender, FamilyPersonProfilePatch } from "@/lib/legacy/types";
import {
  deleteStudioTreeEdge,
  getStudioTreeEdges,
  saveStudioTreeEdge,
  updateStudioTreeEdge,
} from "@/lib/legacy/studioPreviewData";
import type { RelationshipType, TreeEdgeRow } from "@/lib/legacy/treeRelationships";

function persistenceError(err: unknown, fallback: string): Error {
  if (err instanceof Error) return err;
  if (typeof err === "object" && err !== null && "message" in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === "string" && message.trim()) return new Error(message);
  }
  return new Error(fallback);
}

const PHOTO_BUCKET = "family-people-photos";

export async function fetchTreeEdges(
  circleId: string,
  useApi = false,
): Promise<TreeEdgeRow[]> {
  if (isLegacyStudioPreview() && !useApi) {
    return getStudioTreeEdges(circleId);
  }

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

  if (isLegacyStudioPreview() && !useApi) {
    return saveStudioTreeEdge({
      circleId,
      sourcePersonId,
      targetPersonId,
      relationshipType,
    });
  }

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
  if (error) throw persistenceError(error, "Could not save connection.");
  return data as TreeEdgeRow;
}

export async function updateTreeEdge(params: {
  circleId: string;
  edgeId: string;
  relationshipType: RelationshipType;
  useApi?: boolean;
}): Promise<TreeEdgeRow> {
  const { circleId, edgeId, relationshipType, useApi } = params;

  if (isLegacyStudioPreview() && !useApi) {
    return updateStudioTreeEdge({ circleId, edgeId, relationshipType });
  }

  if (useApi) {
    const token = getStoredCircleToken(circleId);
    if (!token) throw new Error("Session expired.");
    const res = await fetch("/api/circle/tree-edge", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        circle_id: circleId,
        edge_id: edgeId,
        relationship_type: relationshipType,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { edge?: TreeEdgeRow; error?: string };
    if (!res.ok) throw new Error(body.error ?? "Could not update connection.");
    if (!body.edge) throw new Error("Could not update connection.");
    return body.edge;
  }

  if (!supabase) throw new Error("Not connected.");
  const { data, error } = await supabase
    .from("tree_edges")
    .update({ relationship_type: relationshipType })
    .eq("id", edgeId)
    .eq("circle_id", circleId)
    .select("*")
    .single();
  if (error) throw persistenceError(error, "Could not update connection.");
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

  if (isLegacyStudioPreview() && !useApi) {
    deleteStudioTreeEdge(circleId, edgeId);
    return;
  }

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
  if (error) throw persistenceError(error, "Could not remove connection.");
}

export type PersonProfilePatch = FamilyPersonProfilePatch & {
  displayName?: string;
  relationLabel?: string;
  careerPath?: string | null;
};

function profilePatchToRow(patch: PersonProfilePatch): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (patch.displayName !== undefined) row.display_name = patch.displayName;
  if (patch.display_name !== undefined) row.display_name = patch.display_name;
  if (patch.relationLabel !== undefined) row.relation_label = patch.relationLabel;
  if (patch.relation_label !== undefined) row.relation_label = patch.relation_label;
  if (patch.gender !== undefined) row.gender = patch.gender;
  if (patch.careerPath !== undefined) row.career_path = patch.careerPath;
  if (patch.career_path !== undefined) row.career_path = patch.career_path;
  if (patch.birthplace !== undefined) row.birthplace = patch.birthplace;
  if (patch.education !== undefined) row.education = patch.education;
  if (patch.languages !== undefined) row.languages = patch.languages;
  if (patch.religion !== undefined) row.religion = patch.religion;
  if (patch.bio !== undefined) row.bio = patch.bio;
  if (patch.nickname !== undefined) row.nickname = patch.nickname;
  if (patch.birth_year !== undefined) row.birth_year = patch.birth_year;
  if (patch.sibling_order !== undefined) row.sibling_order = patch.sibling_order;
  if (patch.death_year !== undefined) row.death_year = patch.death_year;
  return row;
}

export async function savePersonProfile(params: {
  circleId: string;
  personId: string;
  useApi?: boolean;
} & PersonProfilePatch): Promise<FamilyPerson | void> {
  const { circleId, personId, useApi, ...patch } = params;
  const update = profilePatchToRow(patch);
  if (Object.keys(update).length === 0) return;

  const payload = { circle_id: circleId, person_id: personId, ...update };

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

export async function saveSiblingOrders(params: {
  circleId: string;
  orders: { personId: string; sibling_order: number }[];
  useApi?: boolean;
}): Promise<void> {
  const { circleId, orders, useApi } = params;
  for (const { personId, sibling_order } of orders) {
    await savePersonProfile({ circleId, personId, sibling_order, useApi });
  }
}

/** Pin one person as the family leader — tree layout organizes around them. */
export async function setTreeLeader(params: {
  circleId: string;
  personId: string;
  useApi?: boolean;
}): Promise<FamilyPerson> {
  const { circleId, personId, useApi } = params;

  if (useApi) {
    const token = getStoredCircleToken(circleId);
    if (!token) throw new Error("Session expired.");
    const res = await fetch("/api/circle/tree-person", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        circle_id: circleId,
        person_id: personId,
        is_tree_anchor: true,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      person?: FamilyPerson;
    };
    if (!res.ok) throw new Error(body.error ?? "Could not set family leader.");
    return body.person!;
  }

  if (!supabase) throw new Error("Not connected.");
  await supabase
    .from("family_people")
    .update({ is_tree_anchor: false })
    .eq("circle_id", circleId);
  const { data, error } = await supabase
    .from("family_people")
    .update({ is_tree_anchor: true })
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
  appendCopySuffix?: boolean;
  useApi?: boolean;
}): Promise<FamilyPerson> {
  const { circleId, personId, canvasX, canvasY, appendCopySuffix, useApi } = params;

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
        append_copy_suffix: appendCopySuffix ?? false,
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
  const displayName =
    appendCopySuffix && !row.display_name.includes("(copy)")
      ? `${row.display_name} (copy)`
      : row.display_name;
  const { data: created, error: insertError } = await supabase
    .from("family_people")
    .insert({
      circle_id: circleId,
      display_name: displayName,
      relation_label: row.relation_label,
      status: row.status,
      gender: row.gender ?? null,
      career_path: row.career_path ?? null,
      birthplace: row.birthplace ?? null,
      education: row.education ?? null,
      languages: row.languages ?? null,
      religion: row.religion ?? null,
      bio: row.bio ?? null,
      nickname: row.nickname ?? null,
      birth_year: row.birth_year ?? null,
      death_year: row.death_year ?? null,
      photo_url: row.photo_url ?? null,
      adinkra_id: row.adinkra_id ?? null,
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
