alter table public.manager_profiles enable row level security;

drop function if exists public.is_super_admin();
create or replace function public.is_super_admin()
returns boolean
language sql
security definer set search_path = public
as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'manager_role', '')::manager_role = 'super_admin';
$$;

drop policy if exists "Managers view manager profiles" on public.manager_profiles;
create policy "Managers view manager profiles"
  on public.manager_profiles
  for select using (public.is_manager());

drop policy if exists "Super admins insert manager profiles" on public.manager_profiles;
create policy "Super admins insert manager profiles"
  on public.manager_profiles
  for insert with check (public.is_super_admin());

drop policy if exists "Super admins update manager profiles" on public.manager_profiles;
create policy "Super admins update manager profiles"
  on public.manager_profiles
  for update using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "Super admins delete manager profiles" on public.manager_profiles;
create policy "Super admins delete manager profiles"
  on public.manager_profiles
  for delete using (public.is_super_admin());

drop policy if exists "Managers update their profile" on public.manager_profiles;
create policy "Managers update their profile"
  on public.manager_profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);


