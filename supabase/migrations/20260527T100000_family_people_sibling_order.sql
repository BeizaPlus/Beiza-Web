-- Birth order among siblings (1 = eldest / first-born) — used by dagre auto-layout.
ALTER TABLE public.family_people
  ADD COLUMN IF NOT EXISTS sibling_order INTEGER;

COMMENT ON COLUMN public.family_people.sibling_order IS
  'Order among siblings sharing parent_id (1 = eldest). Auto-layout sorts left-to-right by this value.';

CREATE INDEX IF NOT EXISTS idx_family_people_sibling_order
  ON public.family_people (parent_id, sibling_order)
  WHERE sibling_order IS NOT NULL;
