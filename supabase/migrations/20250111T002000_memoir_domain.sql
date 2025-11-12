create table if not exists public.memoirs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  summary text,
  hero_media jsonb,
  status text not null default 'draft',
  last_published_at timestamptz,
  updated_by uuid references public.manager_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memoir_sections (
  id uuid primary key default gen_random_uuid(),
  memoir_id uuid not null references public.memoirs(id) on delete cascade,
  section_type text not null default 'narrative',
  heading text,
  body text,
  display_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memoir_highlights (
  id uuid primary key default gen_random_uuid(),
  memoir_id uuid not null references public.memoirs(id) on delete cascade,
  media jsonb not null,
  caption text,
  display_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memoir_tributes (
  id uuid primary key default gen_random_uuid(),
  memoir_id uuid not null references public.memoirs(id) on delete cascade,
  name text not null,
  relationship text,
  message text not null,
  display_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memoir_timelines (
  id uuid primary key default gen_random_uuid(),
  memoir_id uuid not null references public.memoirs(id) on delete cascade,
  memoir_slug text not null,
  era_label text,
  title text not null,
  excerpt text not null,
  story_url text,
  timestamp date not null,
  end_timestamp date,
  location text,
  tags text[],
  participants text[],
  image jsonb,
  audio_clip_url text,
  is_published boolean not null default false,
  display_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memoir_timelines_unique unique (memoir_id, title)
);

create index if not exists memoir_timelines_slug_idx on public.memoir_timelines (memoir_slug);

create trigger set_timestamp
before update on public.memoirs
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.memoir_sections
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.memoir_highlights
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.memoir_tributes
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.memoir_timelines
for each row execute procedure public.trigger_set_timestamp();

alter table public.memoirs
  add constraint memoirs_status_check
  check (status in ('draft', 'review', 'scheduled', 'published', 'archived'));

