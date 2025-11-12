-- Ensure cryptographic functions for UUID generation
create extension if not exists "pgcrypto";

create type manager_role as enum ('super_admin', 'publisher', 'editor', 'viewer');
create type manager_status as enum ('invited', 'active', 'suspended');

create table if not exists public.manager_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text,
  role manager_role not null default 'viewer',
  status manager_status not null default 'invited',
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manager_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.manager_profiles (id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.trigger_set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_timestamp
before update on public.manager_profiles
for each row
execute procedure public.trigger_set_timestamp();

create or replace function public.is_manager()
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.manager_profiles mp
    where mp.id = auth.uid()
      and mp.status = 'active'
  );
$$;

create or replace function public.manager_role()
returns manager_role
language sql
security definer set search_path = public
as $$
  select role
  from public.manager_profiles
  where id = auth.uid();
$$;

comment on table public.manager_profiles is 'Profiles for authenticated managers that access the admin console.';
comment on table public.manager_audit_log is 'Lightweight audit log capturing manager actions within the CMS.';

