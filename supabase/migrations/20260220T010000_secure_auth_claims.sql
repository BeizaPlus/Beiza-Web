-- Drop the insecure auto-provisioning trigger
drop trigger if exists ensure_manager_profile on auth.users;
drop function if exists public.ensure_manager_profile();

-- Create a secure trigger to sync manager_profiles.role/status to auth.users.raw_app_meta_data
create or replace function public.sync_manager_profile_to_jwt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update auth.users
  set raw_app_meta_data = 
    raw_app_meta_data || 
    jsonb_build_object(
      'manager_role', new.role,
      'manager_status', new.status
    )
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_manager_profile_update on public.manager_profiles;
create trigger on_manager_profile_update
after insert or update on public.manager_profiles
for each row
execute procedure public.sync_manager_profile_to_jwt();

-- Rewrite RLS helper functions to use the JWT claims for vastly better performance and security
create or replace function public.manager_role()
returns manager_role
language sql
security definer set search_path = public
as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'manager_role', '')::manager_role;
$$;

create or replace function public.is_manager()
returns boolean
language sql
security definer set search_path = public
as $$
  select (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'manager_status') = 'active';
$$;

-- We also need to backfill existing profiles to the auth.users table since we are enabling this on existing data
do $$
declare
  r record;
begin
  for r in select id, role, status from public.manager_profiles loop
    update auth.users
    set raw_app_meta_data = 
      coalesce(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object(
        'manager_role', r.role,
        'manager_status', r.status
      )
    where id = r.id;
  end loop;
end;
$$;
