insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'audio/mpeg']
where id = 'public-assets';

insert into storage.buckets (id, name, public)
values ('memoir-media', 'memoir-media', false)
on conflict (id) do nothing;

update storage.buckets
set file_size_limit = 104857600,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav']
where id = 'memoir-media';

-- Public read access for published assets
drop policy if exists "Allow public asset read" on storage.objects;
create policy "Allow public asset read"
on storage.objects
for select
using (
  bucket_id = 'public-assets'
);

-- Managers can manage assets in public bucket
drop policy if exists "Managers manage public assets" on storage.objects;
create policy "Managers manage public assets"
on storage.objects
for all
using (
  bucket_id = 'public-assets' and public.is_manager()
)
with check (
  bucket_id = 'public-assets' and public.is_manager()
);

-- Managers manage memoir media
drop policy if exists "Managers manage memoir media" on storage.objects;
create policy "Managers manage memoir media"
on storage.objects
for all
using (
  bucket_id = 'memoir-media' and public.is_manager()
)
with check (
  bucket_id = 'memoir-media' and public.is_manager()
);


