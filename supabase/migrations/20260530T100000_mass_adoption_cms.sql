-- Mass adoption: product nav in CMS, events hero, richer testimonials for Voices carousel.

-- Product navigation (Vault · Circle · Heritage)
insert into public.navigation_links (label, href, location, display_order, is_published)
values
  ('Vault', '/vault', 'primary', 1, true),
  ('Circle', '/circle', 'primary', 2, true),
  ('Heritage', '/heritage', 'primary', 3, true)
on conflict (label, location) do update
set
  href = excluded.href,
  display_order = excluded.display_order,
  is_published = excluded.is_published,
  updated_at = now();

update public.navigation_links
set is_published = false, updated_at = now()
where location = 'primary'
  and label in ('Live Now', 'Events', 'Gallery', 'Memoirs', 'Legacy', 'Blog')
  and href not in ('/vault', '/circle', '/heritage');

-- Footer sections aligned with current marketing site
insert into public.footer_links (label, href, group_label, display_order, is_published)
values
  ('About Us', '/#about', 'Sections', 1, true),
  ('Events', '/events', 'Sections', 2, true),
  ('Gallery', '/circle', 'Sections', 3, true),
  ('Legacy Vault', '/vault', 'Sections', 4, true),
  ('Memoirs', '/memoirs', 'Sections', 5, true),
  ('Blog', '/blog', 'Sections', 6, true),
  ('Contact', '/contact', 'Sections', 7, true)
on conflict (label, group_label) do update
set
  href = excluded.href,
  display_order = excluded.display_order,
  is_published = excluded.is_published,
  updated_at = now();

-- Events page hero (editable in hero_sections)
insert into public.hero_sections (
  slug, heading, subheading, cta_label, cta_href, background_media, is_published, published_at
)
values (
  'events-hero',
  'Because their story deserves to be unforgettable.',
  'Personal loss, family memory, and gatherings that honor who they were.',
  null,
  null,
  jsonb_build_object(
    'src', '/images/beiza-ernestina-portrait-bw.png',
    'alt', 'Madam Ernestina — portrait in black and white'
  ),
  true,
  now()
)
on conflict (slug) do update
set
  heading = excluded.heading,
  subheading = excluded.subheading,
  background_media = excluded.background_media,
  is_published = excluded.is_published,
  published_at = coalesce(public.hero_sections.published_at, excluded.published_at),
  updated_at = now();

-- Voices / landing testimonials: portraits and ordering from Supabase
alter table public.testimonials
  add column if not exists portrait_url text,
  add column if not exists display_order integer not null default 0,
  add column if not exists is_featured boolean not null default false,
  add column if not exists location text,
  add column if not exists country_code text default 'GH',
  add column if not exists country text,
  add column if not exists initials text,
  add column if not exists relation text;

create index if not exists testimonials_surfaces_order_idx
  on public.testimonials (is_published, display_order);
