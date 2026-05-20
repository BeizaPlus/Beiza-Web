import type { SupabaseClient } from "@supabase/supabase-js";

const RELATIONSHIP_TYPES = [
  "parent_of",
  "child_of",
  "sibling_of",
  "spouse_of",
  "grandparent_of",
  "grandchild_of",
  "uncle_aunt_of",
  "nephew_niece_of",
  "friend_of",
  "other",
] as const;

type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export type PersonaToolName = "add_person" | "connect_people" | "update_person";

export const PERSONA_TOOL_DEFINITIONS = [
  {
    name: "add_person",
    description:
      "Add a new person to the family tree. Call once per person. Returns person_id for connecting.",
    input_schema: {
      type: "object",
      properties: {
        display_name: { type: "string", description: "Full name" },
        relation_label: {
          type: "string",
          description: "Role label e.g. FATHER, UNCLE, CHILD",
        },
        career_path: { type: "string", description: "Occupation or life work" },
        gender: { type: "string", enum: ["male", "female"] },
        parent_person_id: {
          type: "string",
          description: "Optional parent person_id for tree hierarchy",
        },
      },
      required: ["display_name"],
    },
  },
  {
    name: "connect_people",
    description:
      "Connect two people with a relationship edge. Use person_id from add_person or the tree roster.",
    input_schema: {
      type: "object",
      properties: {
        source_person_id: { type: "string" },
        target_person_id: { type: "string" },
        relationship_type: {
          type: "string",
          enum: [...RELATIONSHIP_TYPES],
        },
      },
      required: ["source_person_id", "target_person_id", "relationship_type"],
    },
  },
  {
    name: "update_person",
    description: "Update an existing person's name, role, gender, or career.",
    input_schema: {
      type: "object",
      properties: {
        person_id: { type: "string" },
        display_name: { type: "string" },
        relation_label: { type: "string" },
        career_path: { type: "string" },
        gender: { type: "string", enum: ["male", "female"] },
      },
      required: ["person_id"],
    },
  },
] as const;

type PersonRow = {
  id: string;
  display_name: string;
  canvas_x: number | null;
  canvas_y: number | null;
};

function nextCanvasPosition(existing: PersonRow[]) {
  const placed = existing.filter((p) => p.canvas_x != null && p.canvas_y != null);
  if (placed.length === 0) {
    return { x: 80 + Math.random() * 120, y: 80 + Math.random() * 120 };
  }
  const anchor = placed[placed.length - 1];
  return {
    x: (anchor.canvas_x ?? 0) + 220 + Math.random() * 40,
    y: (anchor.canvas_y ?? 0) + (Math.random() - 0.5) * 80,
  };
}

function isRelationshipType(value: string): value is RelationshipType {
  return (RELATIONSHIP_TYPES as readonly string[]).includes(value);
}

export async function executePersonaTool(
  supabase: SupabaseClient,
  circleId: string,
  toolName: PersonaToolName,
  input: Record<string, unknown>,
): Promise<{ ok: true; result: Record<string, unknown> } | { ok: false; error: string }> {
  const { data: roster } = await supabase
    .from("family_people")
    .select("id, display_name, canvas_x, canvas_y")
    .eq("circle_id", circleId);

  const people = (roster ?? []) as PersonRow[];

  if (toolName === "add_person") {
    const displayName = String(input.display_name ?? "").trim();
    if (!displayName) return { ok: false, error: "display_name is required" };

    const pos = nextCanvasPosition(people);
    const { data, error } = await supabase
      .from("family_people")
      .insert({
        circle_id: circleId,
        display_name: displayName,
        relation_label: input.relation_label
          ? String(input.relation_label).trim().toUpperCase()
          : "FAMILY",
        career_path: input.career_path ? String(input.career_path).trim() : null,
        gender:
          input.gender === "male" || input.gender === "female" ? input.gender : null,
        parent_id: input.parent_person_id ? String(input.parent_person_id) : null,
        status: "living",
        canvas_x: pos.x,
        canvas_y: pos.y,
      })
      .select("id, display_name, relation_label, career_path, gender")
      .single();

    if (error) return { ok: false, error: error.message };
    return {
      ok: true,
      result: {
        person_id: data.id,
        display_name: data.display_name,
        relation_label: data.relation_label,
      },
    };
  }

  if (toolName === "connect_people") {
    const sourceId = String(input.source_person_id ?? "").trim();
    const targetId = String(input.target_person_id ?? "").trim();
    const rel = String(input.relationship_type ?? "").trim();

    if (!sourceId || !targetId) {
      return { ok: false, error: "source_person_id and target_person_id are required" };
    }
    if (!isRelationshipType(rel)) {
      return { ok: false, error: `relationship_type must be one of: ${RELATIONSHIP_TYPES.join(", ")}` };
    }
    if (sourceId === targetId) {
      return { ok: false, error: "Cannot connect a person to themselves" };
    }

    const { data, error } = await supabase
      .from("tree_edges")
      .insert({
        circle_id: circleId,
        source_person_id: sourceId,
        target_person_id: targetId,
        relationship_type: rel,
      })
      .select("id, relationship_type")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { ok: true, result: { edge_id: null, note: "already_connected" } };
      }
      return { ok: false, error: error.message };
    }

    return {
      ok: true,
      result: { edge_id: data.id, relationship_type: data.relationship_type },
    };
  }

  if (toolName === "update_person") {
    const personId = String(input.person_id ?? "").trim();
    if (!personId) return { ok: false, error: "person_id is required" };

    const update: Record<string, string | null> = {};
    if (input.display_name !== undefined) {
      const name = String(input.display_name).trim();
      if (!name) return { ok: false, error: "display_name cannot be empty" };
      update.display_name = name;
    }
    if (input.relation_label !== undefined) {
      update.relation_label = String(input.relation_label).trim().toUpperCase() || "FAMILY";
    }
    if (input.career_path !== undefined) {
      update.career_path = String(input.career_path).trim() || null;
    }
    if (input.gender !== undefined) {
      const g = String(input.gender).toLowerCase();
      if (g !== "male" && g !== "female") {
        return { ok: false, error: "gender must be male or female" };
      }
      update.gender = g;
    }

    if (Object.keys(update).length === 0) {
      return { ok: false, error: "No fields to update" };
    }

    const { data, error } = await supabase
      .from("family_people")
      .update(update)
      .eq("id", personId)
      .eq("circle_id", circleId)
      .select("id, display_name, relation_label, career_path, gender")
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, result: { person: data } };
  }

  return { ok: false, error: `Unknown tool: ${toolName}` };
}

export function formatTreeRosterForPrompt(
  people: { id: string; display_name: string; relation_label?: string | null; career_path?: string | null }[],
) {
  if (people.length === 0) return "Tree is empty — use add_person to start.";
  return people
    .map(
      (p) =>
        `- ${p.display_name} (id: ${p.id})${p.relation_label ? ` · ${p.relation_label}` : ""}${p.career_path ? ` · ${p.career_path}` : ""}`,
    )
    .join("\n");
}
