-- Gallery assets table for managing images displayed on the /gallery page
create table if not exists public.gallery_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  alt text not null,
  caption text,
  memoir_id uuid references public.memoirs(id) on delete set null,
  display_order integer default 0,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

-- Indexes for performance
create index if not exists gallery_assets_memoir_id_idx on public.gallery_assets(memoir_id);
create index if not exists gallery_assets_is_published_idx on public.gallery_assets(is_published);
create index if not exists gallery_assets_display_order_idx on public.gallery_assets(display_order);

-- Updated_at trigger
create or replace function update_gallery_assets_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_gallery_assets_updated_at
  before update on public.gallery_assets
  for each row
  execute function update_gallery_assets_updated_at();

-- RLS policies
alter table public.gallery_assets enable row level security;

-- Public can view published gallery assets
create policy "Public can view published gallery assets"
on public.gallery_assets
for select
using (is_published = true);

-- Managers can manage all gallery assets
create policy "Managers can manage gallery assets"
on public.gallery_assets
for all
using (public.is_manager())
with check (public.is_manager());

