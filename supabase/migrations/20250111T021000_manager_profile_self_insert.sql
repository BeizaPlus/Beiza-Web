drop policy if exists "Managers insert their profile" on public.manager_profiles;
create policy "Managers insert their profile"
on public.manager_profiles
for insert
with check (auth.uid() = id);


