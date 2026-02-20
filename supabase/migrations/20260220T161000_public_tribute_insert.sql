-- Add policy to allow public submissions of tributes for published memoirs
create policy "Public can insert tributes"
  on public.memoir_tributes
  for insert
  with check (
    exists (
      select 1 from public.memoirs m
      where m.id = memoir_id
        and m.status = 'published'
    )
  );
