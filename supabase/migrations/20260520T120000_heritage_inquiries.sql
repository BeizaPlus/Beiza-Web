-- Heritage / White Swan consultation inquiries (inserted via serverless API only)

create table if not exists public.heritage_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  country text,
  planning_for text,
  message text,
  referral_source text,
  created_at timestamptz not null default now()
);

alter table public.heritage_inquiries enable row level security;

-- No public policies: inserts go through service role on /api/heritage-inquiry

comment on table public.heritage_inquiries is 'White Swan / Heritage consultation form submissions';
