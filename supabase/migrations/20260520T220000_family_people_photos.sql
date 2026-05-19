-- Person portraits on tree nodes + public storage bucket

ALTER TABLE family_people
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

COMMENT ON COLUMN family_people.photo_url IS 'Public URL for tree node portrait';

INSERT INTO storage.buckets (id, name, public)
VALUES ('family-people-photos', 'family-people-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "family_people_photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'family-people-photos');

CREATE POLICY "family_people_photos_authenticated_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'family-people-photos' AND auth.uid() IS NOT NULL);
