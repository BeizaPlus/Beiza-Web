-- Allow circle creators to read their circle immediately after insert (before member row exists)
CREATE POLICY "legacy_circles_select_creator"
  ON family_circles FOR SELECT
  USING (created_by = auth.uid());
