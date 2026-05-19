-- Silent prompt taxonomy on recordings (user only sees question text in `prompt`)

ALTER TABLE public.recordings
  ADD COLUMN IF NOT EXISTS prompt_id text,
  ADD COLUMN IF NOT EXISTS prompt_category text,
  ADD COLUMN IF NOT EXISTS prompt_arc_position text,
  ADD COLUMN IF NOT EXISTS prompt_tags text[] DEFAULT '{}';

COMMENT ON COLUMN public.recordings.prompt_id IS 'Story bank id e.g. food_001';
COMMENT ON COLUMN public.recordings.prompt_category IS 'Thematic bucket: origins, people, food, etc.';
COMMENT ON COLUMN public.recordings.prompt_arc_position IS 'Narrative arc: childhood, elegy, transmission, etc.';
COMMENT ON COLUMN public.recordings.prompt_tags IS 'Semantic tags for future AI assembly';
