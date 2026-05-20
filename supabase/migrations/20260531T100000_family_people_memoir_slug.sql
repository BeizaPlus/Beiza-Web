-- Link a tree person to a published memoir (one slug → /memoirs/{slug}).
ALTER TABLE public.family_people
  ADD COLUMN IF NOT EXISTS memoir_slug text;

COMMENT ON COLUMN public.family_people.memoir_slug IS
  'Published memoir slug. Double-click on the family tree opens /memoirs/{memoir_slug}.';

CREATE INDEX IF NOT EXISTS idx_family_people_memoir_slug
  ON public.family_people (memoir_slug)
  WHERE memoir_slug IS NOT NULL;
