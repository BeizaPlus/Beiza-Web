-- Person profile fields; read via GET /api/circle/tree-data (SELECT * on family_people).

ALTER TABLE family_people
  ADD COLUMN IF NOT EXISTS gender TEXT
    CHECK (gender IS NULL OR gender IN ('male', 'female')),
  ADD COLUMN IF NOT EXISTS career_path TEXT;

COMMENT ON COLUMN family_people.gender IS 'male | female | null';
COMMENT ON COLUMN family_people.career_path IS 'Free-text career path label';
