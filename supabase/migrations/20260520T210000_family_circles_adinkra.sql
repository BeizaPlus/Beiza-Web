-- Per-circle Adinkra identity (directory cards + enter gate)

ALTER TABLE family_circles
  ADD COLUMN IF NOT EXISTS adinkra_id TEXT;

COMMENT ON COLUMN family_circles.adinkra_id IS 'Adinkra symbol id, e.g. sankofa — see src/lib/adinkra.ts';

-- Backfill existing circles with a random symbol
UPDATE family_circles
SET adinkra_id = (
  ARRAY[
    'sankofa', 'gye-nyame', 'duafe', 'ese-ne-tekrema',
    'nyame-biribi-wo-soro', 'funtunfunefu', 'akoma', 'aya'
  ]
)[1 + floor(random() * 8)::int]
WHERE adinkra_id IS NULL;

CREATE OR REPLACE FUNCTION list_public_family_circles()
RETURNS TABLE (
  id UUID,
  name TEXT,
  member_count BIGINT,
  memory_count BIGINT,
  since_year INTEGER,
  is_in_memoriam BOOLEAN,
  adinkra_id TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.name,
    (
      SELECT count(*)::bigint
      FROM family_people p
      WHERE p.circle_id = c.id
    ) + (
      SELECT count(*)::bigint
      FROM family_members fm
      WHERE fm.circle_id = c.id
    ) AS member_count,
    (SELECT count(*)::bigint FROM recordings r WHERE r.circle_id = c.id) AS memory_count,
    c.since_year,
    c.is_in_memoriam,
    c.adinkra_id
  FROM family_circles c
  ORDER BY c.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION get_public_circle_cover(p_circle_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  member_count BIGINT,
  memory_count BIGINT,
  since_year INTEGER,
  is_in_memoriam BOOLEAN,
  adinkra_id TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.name,
    (
      SELECT count(*)::bigint FROM family_people p WHERE p.circle_id = c.id
    ) + (
      SELECT count(*)::bigint FROM family_members fm WHERE fm.circle_id = c.id
    ),
    (SELECT count(*)::bigint FROM recordings r WHERE r.circle_id = c.id),
    c.since_year,
    c.is_in_memoriam,
    c.adinkra_id
  FROM family_circles c
  WHERE c.id = p_circle_id;
$$;
