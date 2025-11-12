create table if not exists public.hero_sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  heading text not null,
  subheading text,
  cta_label text,
  cta_href text,
  background_media jsonb,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.offerings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon_key text,
  display_order integer default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint offerings_title_unique unique (title)
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author text not null,
  role text,
  surfaces text[] default '{}',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint testimonials_quote_unique unique (quote)
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  display_order integer default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint faqs_question_unique unique (question)
);

create table if not exists public.pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text,
  price_label text,
  description text,
  badge_label text,
  is_recommended boolean not null default false,
  is_published boolean not null default true,
  display_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pricing_tiers_name_unique unique (name)
);

create table if not exists public.pricing_features (
  id uuid primary key default gen_random_uuid(),
  tier_id uuid not null references public.pricing_tiers(id) on delete cascade,
  label text not null,
  display_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pricing_features_unique unique (tier_id, label)
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon_key text,
  display_order integer default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_title_unique unique (title)
);

create table if not exists public.process_steps (
  id uuid primary key default gen_random_uuid(),
  step_number integer not null,
  title text not null,
  description text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint process_steps_number_unique unique (step_number)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  location text,
  occurs_on date,
  hero_media jsonb,
  description text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_media (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  media jsonb not null,
  display_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_media_unique unique (event_id, display_order)
);

create table if not exists public.contact_channels (
  id uuid primary key default gen_random_uuid(),
  channel_type text not null,
  label text,
  value text not null,
  display_order integer default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_channels_unique unique (channel_type, value)
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_label text,
  is_published boolean not null default true,
  display_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint packages_name_unique unique (name)
);

create table if not exists public.package_features (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  label text not null,
  display_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint package_features_unique unique (package_id, label)
);

create table if not exists public.navigation_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  location text default 'primary',
  display_order integer default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint navigation_links_unique unique (label, location)
);

create table if not exists public.footer_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  group_label text,
  display_order integer default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint footer_links_unique unique (label, group_label)
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_timestamp
before update on public.hero_sections
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.offerings
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.testimonials
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.faqs
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.pricing_tiers
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.pricing_features
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.services
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.process_steps
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.events
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.event_media
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.contact_channels
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.packages
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.package_features
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.navigation_links
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.footer_links
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.site_settings
for each row execute procedure public.trigger_set_timestamp();

