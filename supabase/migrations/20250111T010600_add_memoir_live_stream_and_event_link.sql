alter table public.memoirs
  add column if not exists live_stream_platform text default 'youtube',
  add column if not exists live_stream_title text,
  add column if not exists live_stream_url text,
  add column if not exists live_stream_embed_url text,
  add column if not exists live_stream_is_active boolean default false;

alter table public.events
  add column if not exists memoir_id uuid references public.memoirs(id) on delete set null,
  add column if not exists memoir_slug text;

create index if not exists events_memoir_slug_idx on public.events (memoir_slug);

update public.events
set memoir_slug = coalesce(memoir_slug, slug);

update public.events e
set memoir_id = m.id
from public.memoirs m
where e.memoir_slug is not null
  and m.slug = e.memoir_slug;

update public.memoirs
set live_stream_platform = coalesce(live_stream_platform, 'youtube'),
    live_stream_title = coalesce(live_stream_title, 'Monica Manu Celebration Livestream'),
    live_stream_url = coalesce(live_stream_url, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    live_stream_embed_url = coalesce(live_stream_embed_url, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
    live_stream_is_active = coalesce(live_stream_is_active, true)
where slug = 'monica-manu';



