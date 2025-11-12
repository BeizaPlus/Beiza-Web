-- Create blog_posts table
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  featured_image jsonb,
  status text not null default 'draft',
  published_at timestamptz,
  last_published_at timestamptz,
  updated_by uuid references public.manager_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add status constraint
alter table public.blog_posts
  add constraint blog_posts_status_check
  check (status in ('draft', 'published', 'archived'));

-- Create index on slug for fast lookups
create index if not exists blog_posts_slug_idx on public.blog_posts (slug);

-- Create index on status and published_at for public queries
create index if not exists blog_posts_status_published_idx on public.blog_posts (status, published_at desc);

-- Create trigger for updated_at timestamp
create trigger set_timestamp
before update on public.blog_posts
for each row execute procedure public.trigger_set_timestamp();

-- Enable RLS
alter table public.blog_posts enable row level security;

-- RLS Policies
-- Public can read published blog posts
drop policy if exists "Public blog posts" on public.blog_posts;
create policy "Public blog posts"
  on public.blog_posts
  for select
  using (status = 'published');

-- Managers can manage blog posts
drop policy if exists "Managers manage blog posts" on public.blog_posts;
create policy "Managers manage blog posts"
  on public.blog_posts
  for all using (public.is_manager()) with check (public.is_manager());

