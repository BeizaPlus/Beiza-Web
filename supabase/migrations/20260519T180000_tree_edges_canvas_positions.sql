-- Freeform family tree: saved canvas positions + intentional person-to-person edges

ALTER TABLE family_people
  ADD COLUMN IF NOT EXISTS canvas_x double precision,
  ADD COLUMN IF NOT EXISTS canvas_y double precision;

CREATE TABLE IF NOT EXISTS tree_edges (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id          UUID NOT NULL REFERENCES family_circles(id) ON DELETE CASCADE,
  source_person_id   UUID NOT NULL REFERENCES family_people(id) ON DELETE CASCADE,
  target_person_id   UUID NOT NULL REFERENCES family_people(id) ON DELETE CASCADE,
  relationship_type  TEXT NOT NULL CHECK (char_length(trim(relationship_type)) > 0),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tree_edges_no_self CHECK (source_person_id <> target_person_id),
  CONSTRAINT tree_edges_unique_pair UNIQUE (circle_id, source_person_id, target_person_id)
);

CREATE INDEX IF NOT EXISTS idx_tree_edges_circle ON tree_edges (circle_id);
CREATE INDEX IF NOT EXISTS idx_tree_edges_source ON tree_edges (source_person_id);
CREATE INDEX IF NOT EXISTS idx_tree_edges_target ON tree_edges (target_person_id);

ALTER TABLE tree_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tree_edges_select_circle_member"
  ON tree_edges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.circle_id = tree_edges.circle_id
        AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "tree_edges_mutate_circle_member"
  ON tree_edges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.circle_id = tree_edges.circle_id
        AND fm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.circle_id = tree_edges.circle_id
        AND fm.user_id = auth.uid()
    )
  );
