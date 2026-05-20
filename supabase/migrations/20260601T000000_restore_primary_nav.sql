-- Restore primary navigation to the public marketing nav.
-- The 20260530 migration seeded Vault/Circle/Heritage and unpublished the
-- marketing links. This reverses that: the public site nav is
-- Live Now → Events → Gallery → Legacy → Blog → Contact.

-- Unpublish the studio-era entries
update public.navigation_links
set is_published = false, updated_at = now()
where location = 'primary'
  and label in ('Vault', 'Circle', 'Heritage');

-- Re-publish / upsert the correct marketing nav
insert into public.navigation_links (label, href, location, display_order, is_published)
values
  ('Live Now',  '/live-now', 'primary', 1, true),
  ('Events',    '/events',   'primary', 2, true),
  ('Gallery',   '/gallery',  'primary', 3, true),
  ('Legacy',    '/legacy',   'primary', 4, true),
  ('Blog',      '/blog',     'primary', 5, true),
  ('Contact',   '/contact',  'primary', 6, true)
on conflict (label, location) do update
set
  href          = excluded.href,
  display_order = excluded.display_order,
  is_published  = true,
  updated_at    = now();
