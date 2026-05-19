-- Family tree: people nodes + recording links + biography assembly
-- The tree is a living document built from recordings, not manual forms.

CREATE TYPE family_person_status AS ENUM ('living', 'gone', 'invited');

CREATE TYPE recording_person_link_type AS ENUM ('about', 'by');

CREATE TABLE family_people (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id       UUID NOT NULL REFERENCES family_circles(id) ON DELETE CASCADE,
  display_name    TEXT NOT NULL CHECK (char_length(trim(display_name)) BETWEEN 1 AND 120),
  relation_label  TEXT,
  status          family_person_status NOT NULL DEFAULT 'invited',
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  member_id       UUID REFERENCES family_members(id) ON DELETE SET NULL,
  parent_id       UUID REFERENCES family_people(id) ON DELETE SET NULL,
  is_tree_anchor  BOOLEAN NOT NULL DEFAULT false,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (circle_id, member_id)
);

CREATE TABLE recording_person_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id  UUID NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  person_id     UUID NOT NULL REFERENCES family_people(id) ON DELETE CASCADE,
  link_type     recording_person_link_type NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (recording_id, person_id, link_type)
);

CREATE INDEX idx_family_people_circle ON family_people (circle_id);
CREATE INDEX idx_family_people_parent ON family_people (parent_id);
CREATE INDEX idx_family_people_user ON family_people (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_recording_person_links_person ON recording_person_links (person_id);
CREATE INDEX idx_recording_person_links_recording ON recording_person_links (recording_id);

ALTER TABLE family_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE recording_person_links ENABLE ROW LEVEL SECURITY;

-- family_people policies
CREATE POLICY "legacy_people_select_circle"
  ON family_people FOR SELECT
  USING (legacy_user_in_circle(circle_id));

CREATE POLICY "legacy_people_insert_member"
  ON family_people FOR INSERT
  WITH CHECK (legacy_user_in_circle(circle_id) AND created_by = auth.uid());

CREATE POLICY "legacy_people_update_member"
  ON family_people FOR UPDATE
  USING (legacy_user_in_circle(circle_id));

-- recording_person_links policies
CREATE POLICY "legacy_recording_links_select_circle"
  ON recording_person_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recordings r
      JOIN family_people p ON p.id = recording_person_links.person_id
      WHERE r.id = recording_person_links.recording_id
        AND legacy_user_in_circle(r.circle_id)
        AND legacy_user_in_circle(p.circle_id)
    )
  );

CREATE POLICY "legacy_recording_links_insert_member"
  ON recording_person_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recordings r
      WHERE r.id = recording_id
        AND r.recorded_by = auth.uid()
        AND legacy_user_in_circle(r.circle_id)
    )
    AND EXISTS (
      SELECT 1 FROM family_people p
      WHERE p.id = person_id AND legacy_user_in_circle(p.circle_id)
    )
  );

-- Arc order for biography assembly
CREATE OR REPLACE FUNCTION legacy_arc_sort_key(pos TEXT)
RETURNS INT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE pos
    WHEN 'prologue' THEN 1
    WHEN 'childhood' THEN 2
    WHEN 'becoming' THEN 3
    WHEN 'present' THEN 4
    WHEN 'reflection' THEN 5
    WHEN 'transmission' THEN 6
    WHEN 'elegy' THEN 7
    ELSE 99
  END;
$$;

-- Biography fragments for a person (ordered by life arc)
CREATE OR REPLACE FUNCTION get_person_biography(p_person_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_circle_id UUID;
  v_result JSONB;
BEGIN
  SELECT circle_id INTO v_circle_id FROM family_people WHERE id = p_person_id;
  IF v_circle_id IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  IF NOT legacy_user_in_circle(v_circle_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.arc_sort, t.recorded_at), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT
      r.id AS recording_id,
      r.audio_url,
      r.prompt AS prompt_text,
      r.prompt_category,
      r.prompt_arc_position AS arc_position,
      legacy_arc_sort_key(r.prompt_arc_position::text) AS arc_sort,
      r.title,
      r.created_at AS recorded_at,
      l.link_type,
      jsonb_build_object(
        'name', COALESCE(recorder_person.display_name, recorder_member.display_name, 'Family member'),
        'relation', recorder_person.relation_label
      ) AS recorded_by
    FROM recording_person_links l
    JOIN recordings r ON r.id = l.recording_id
    LEFT JOIN family_members recorder_member ON recorder_member.user_id = r.recorded_by
      AND recorder_member.circle_id = r.circle_id
    LEFT JOIN family_people recorder_person ON recorder_person.member_id = recorder_member.id
    WHERE l.person_id = p_person_id
  ) t;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_person_biography(UUID) TO authenticated;
