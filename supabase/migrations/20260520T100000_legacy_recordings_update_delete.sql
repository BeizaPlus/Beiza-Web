-- Allow circle members to rename recordings; keepers can delete their circle's recordings

drop policy if exists "legacy_recordings_update_member" on public.recordings;
create policy "legacy_recordings_update_member"
  on public.recordings
  for update
  using (public.legacy_user_in_circle(circle_id))
  with check (public.legacy_user_in_circle(circle_id));

drop policy if exists "legacy_recordings_delete_member" on public.recordings;
create policy "legacy_recordings_delete_member"
  on public.recordings
  for delete
  using (
    recorded_by = auth.uid()
    or exists (
      select 1 from public.family_members m
      where m.circle_id = recordings.circle_id
        and m.user_id = auth.uid()
        and m.role = 'keeper'
    )
  );
