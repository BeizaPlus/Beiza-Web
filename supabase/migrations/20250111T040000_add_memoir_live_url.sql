-- Add live_url field to memoirs table for linking to published/live memoir pages
alter table public.memoirs
  add column if not exists live_url text;

comment on column public.memoirs.live_url is 'External URL to the live/published memoir page. Used when memoir is published and hosted elsewhere.';

