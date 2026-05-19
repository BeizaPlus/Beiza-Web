import { supabase } from "@/lib/supabaseClient";
import { getStoredCircleToken } from "@/lib/circleAccess";
import type { RelationshipType, TreeEdgeRow } from "@/lib/legacy/treeRelationships";

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

export async function savePersonProfile(params: {
  circleId: string;
  personId: string;
  displayName: string;
  relationLabel: string;
  useApi?: boolean;
}): Promise<void> {
  const { circleId, personId, displayName, relationLabel, useApi } = params;

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
        display_name: displayName,
        relation_label: relationLabel,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Could not update person.");
    return;
  }

  if (!supabase) throw new Error("Not connected.");
  const { error } = await supabase
    .from("family_people")
    .update({
      display_name: displayName,
      relation_label: relationLabel,
    })
    .eq("id", personId)
    .eq("circle_id", circleId);
  if (error) throw error;
}
