-- Ernestina memoir is source of truth for live event card imagery and copy.
-- Fixes wrong hero on events when admin overwrote events.hero_media.

insert into public.memoirs (slug, title, subtitle, summary, hero_media, status, last_published_at)
values (
  'madam-ernestina',
  'The Life of Madam Ernestina',
  'A life preserved in voice, image, and family memory',
  'Walk through Madam Ernestina''s legacy — archive, voices, and the production unfolding in Kumasi.',
  jsonb_build_object(
    'src', '/images/beiza-ernestina-portrait-bw.png',
    'alt', 'Madam Ernestina — portrait in black and white'
  ),
  'published',
  now()
)
on conflict (slug) do update
set
  title = excluded.title,
  subtitle = excluded.subtitle,
  summary = excluded.summary,
  hero_media = excluded.hero_media,
  status = excluded.status,
  last_published_at = coalesce(public.memoirs.last_published_at, excluded.last_published_at),
  updated_at = now();

update public.events e
set
  memoir_slug = 'madam-ernestina',
  memoir_id = m.id,
  title = m.title,
  hero_media = m.hero_media,
  subtitle = coalesce(e.subtitle, 'Live production in progress'),
  description = coalesce(e.description, m.summary),
  updated_at = now()
from public.memoirs m
where e.slug = 'madam-ernestina'
  and m.slug = 'madam-ernestina';

update public.events e
set
  memoir_id = m.id,
  memoir_slug = coalesce(e.memoir_slug, m.slug),
  hero_media = m.hero_media,
  title = coalesce(e.title, m.title),
  updated_at = now()
from public.memoirs m
where e.slug = 'monica-manu'
  and m.slug = 'monica-manu';
