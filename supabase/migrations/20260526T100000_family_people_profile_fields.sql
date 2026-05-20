-- Deep profile fields for patterns engine (read via tree-data SELECT *)

ALTER TABLE public.family_people
  ADD COLUMN IF NOT EXISTS birthplace TEXT,
  ADD COLUMN IF NOT EXISTS education TEXT,
  ADD COLUMN IF NOT EXISTS languages TEXT[],
  ADD COLUMN IF NOT EXISTS religion TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS nickname TEXT,
  ADD COLUMN IF NOT EXISTS birth_year INTEGER,
  ADD COLUMN IF NOT EXISTS death_year INTEGER,
  ADD COLUMN IF NOT EXISTS adinkra_id TEXT;

COMMENT ON COLUMN public.family_people.birthplace IS 'Place of birth — patterns dataset';
COMMENT ON COLUMN public.family_people.education IS 'Education path — patterns dataset';
COMMENT ON COLUMN public.family_people.languages IS 'Languages spoken — patterns dataset';
COMMENT ON COLUMN public.family_people.religion IS 'Faith tradition — patterns dataset';
COMMENT ON COLUMN public.family_people.bio IS 'Free-text biography — patterns dataset';
COMMENT ON COLUMN public.family_people.nickname IS 'Known-as name — patterns dataset';
COMMENT ON COLUMN public.family_people.birth_year IS 'Birth year — patterns dataset';
COMMENT ON COLUMN public.family_people.death_year IS 'Death year when status is gone';
