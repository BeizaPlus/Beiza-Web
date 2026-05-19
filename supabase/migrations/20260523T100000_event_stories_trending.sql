-- Events page: live productions (top) + trending story carousel (MasterClass-style rows)

alter table public.events
  add column if not exists is_live boolean not null default false,
  add column if not exists subtitle text,
  add column if not exists duration_label text,
  add column if not exists display_order integer not null default 0;

create table if not exists public.event_stories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  duration_label text,
  hero_media jsonb,
  memoir_slug text,
  is_new boolean not null default false,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_stories_published_order_idx
  on public.event_stories (is_published, display_order);

-- Preserve Monica Manu as primary live + featured production
update public.events
set
  is_live = true,
  is_featured = true,
  is_published = true,
  subtitle = coalesce(subtitle, 'A cinematic homegoing celebration'),
  duration_label = coalesce(duration_label, 'Live archive · Full memoir'),
  display_order = 0
where slug = 'monica-manu';

-- Second live event: Ernestina (Events hero portrait)
insert into public.events (
  slug,
  title,
  location,
  occurs_on,
  hero_media,
  description,
  subtitle,
  duration_label,
  is_featured,
  is_published,
  is_live,
  display_order,
  memoir_slug
)
values (
  'madam-ernestina',
  'The Life of Madam Ernestina',
  'Kumasi, Ghana',
  '2026-03-15',
  jsonb_build_object(
    'src', '/images/beiza-ernestina-portrait-bw.png',
    'alt', 'Madam Ernestina — portrait in black and white'
  ),
  'An intimate legacy gathering — voices, archive, and family presence preserved for generations.',
  'Live production in progress',
  'Streaming soon',
  false,
  true,
  true,
  1,
  'madam-ernestina'
)
on conflict (slug) do update
set
  title = excluded.title,
  location = excluded.location,
  occurs_on = excluded.occurs_on,
  hero_media = excluded.hero_media,
  description = excluded.description,
  subtitle = excluded.subtitle,
  duration_label = excluded.duration_label,
  is_published = excluded.is_published,
  is_live = excluded.is_live,
  display_order = excluded.display_order,
  memoir_slug = excluded.memoir_slug,
  updated_at = now();

-- Trending stories row (~10 cards — editable in Supabase later)
insert into public.event_stories (
  slug, title, subtitle, duration_label, hero_media, memoir_slug, is_new, display_order, is_published
) values
  (
    'monica-manu-story',
    'Madam Monica Manu',
    'A matriarch whose faith and generosity shaped a community',
    '2 hours 18 minutes',
    jsonb_build_object(
      'src', 'https://framerusercontent.com/images/YRsXM0Ss8CIUK02VdEkSJYDNdHU.png?width=1658&height=1151',
      'alt', 'Celebration of Madam Monica Manu'
    ),
    'monica-manu',
    true,
    1,
    true
  ),
  (
    'kwame-osei-legacy',
    'Kwame Osei',
    'Teaches preserving family trade stories across generations',
    '1 hour 42 minutes',
    jsonb_build_object(
      'src', 'https://framerusercontent.com/images/hOuECFey8F4ua6LAYVX7DHPnQ.png?width=1684&height=1140',
      'alt', 'Family gathered in celebration'
    ),
  null,
    true,
    2,
    true
  ),
  (
    'ama-darko-voices',
    'Ama Darko',
    'Teaches recording elders before the stories fade',
    '58 minutes',
    jsonb_build_object(
      'src', 'https://framerusercontent.com/images/xsBNx9mI9Ew3pAqs1HZ9ywLrp0.png?width=1741&height=1153',
      'alt', 'Moments of song and remembrance'
    ),
    null,
    false,
    3,
    true
  ),
  (
    'homegoing-series',
    'Homegoing',
    'Original series · Three families, one archive',
    '3 episodes',
    jsonb_build_object(
      'src', 'https://framerusercontent.com/images/hOxvbbCIefKg5M5GXOo8yBqATo.png?width=799&height=823',
      'alt', 'Joyful family remembrance'
    ),
    null,
    true,
    4,
    true
  ),
  (
    'efua-mensah-tribute',
    'Efua Mensah',
    'Teaches designing a tribute that feels like them',
    '1 hour 21 minutes',
    jsonb_build_object(
      'src', 'https://framerusercontent.com/images/YRsXM0Ss8CIUK02VdEkSJYDNdHU.png?width=1658&height=1151',
      'alt', 'Tribute film still'
    ),
    null,
    false,
    5,
    true
  ),
  (
    'kofi-annan-circle',
    'The Annan Circle',
    'How a diaspora family rebuilt their vault from Accra to London',
    '2 hours 4 minutes',
    jsonb_build_object(
      'src', 'https://framerusercontent.com/images/hOuECFey8F4ua6LAYVX7DHPnQ.png?width=1684&height=1140',
      'alt', 'Family circle archive'
    ),
    null,
    false,
    6,
    true
  ),
  (
    'yaa-asantewaa-wisdom',
    'Yaa Asantewaa',
    'Teaches passing wisdom to grandchildren in Twi and English',
    '47 minutes',
    jsonb_build_object(
      'src', 'https://framerusercontent.com/images/xsBNx9mI9Ew3pAqs1HZ9ywLrp0.png?width=1741&height=1153',
      'alt', 'Elder sharing wisdom'
    ),
    null,
    true,
    7,
    true
  ),
  (
    'beiza-white-swan',
    'White Swan',
    'On-the-ground memorial coordination — a Beiza Heritage film',
    '1 hour 12 minutes',
    jsonb_build_object(
      'src', 'https://framerusercontent.com/images/hOxvbbCIefKg5M5GXOo8yBqATo.png?width=799&height=823',
      'alt', 'Memorial gathering'
    ),
    null,
    false,
    8,
    true
  ),
  (
    'nana-yaw-archive',
    'Nana Yaw',
    'Building a vault when the family is spread across four countries',
    '1 hour 35 minutes',
    jsonb_build_object(
      'src', 'https://framerusercontent.com/images/YRsXM0Ss8CIUK02VdEkSJYDNdHU.png?width=1658&height=1151',
      'alt', 'Archive production'
    ),
    null,
    false,
    9,
    true
  ),
  (
    'voices-that-stayed',
    'Voices That Stayed',
    'Families on Beiza share what preservation changed for them',
    '6 stories',
    jsonb_build_object(
      'src', '/images/beiza-ernestina-portrait-bw.png',
      'alt', 'Portrait — legacy preserved'
    ),
    null,
    false,
    10,
    true
  )
on conflict (slug) do update
set
  title = excluded.title,
  subtitle = excluded.subtitle,
  duration_label = excluded.duration_label,
  hero_media = excluded.hero_media,
  memoir_slug = excluded.memoir_slug,
  is_new = excluded.is_new,
  display_order = excluded.display_order,
  is_published = excluded.is_published,
  updated_at = now();

alter table public.event_stories enable row level security;

drop policy if exists "Public event stories" on public.event_stories;
create policy "Public event stories"
  on public.event_stories
  for select using (is_published);

drop policy if exists "Managers manage event stories" on public.event_stories;
create policy "Managers manage event stories"
  on public.event_stories
  for all using (public.is_manager()) with check (public.is_manager());
