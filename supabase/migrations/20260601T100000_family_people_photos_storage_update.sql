-- Allow authenticated legacy users to replace portraits (storage upsert / overwrite)

CREATE POLICY "family_people_photos_authenticated_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'family-people-photos' AND auth.uid() IS NOT NULL)
  WITH CHECK (bucket_id = 'family-people-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "family_people_photos_authenticated_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'family-people-photos' AND auth.uid() IS NOT NULL);
