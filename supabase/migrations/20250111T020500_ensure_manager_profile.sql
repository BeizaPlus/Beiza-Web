create or replace function public.ensure_manager_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.manager_profiles (id, email, role, status)
  values (new.id, new.email, coalesce((new.raw_user_meta_data->>'role')::manager_role, 'editor'), 'active')
  on conflict (id) do update
    set email = excluded.email,
        status = 'active',
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists ensure_manager_profile on auth.users;
create trigger ensure_manager_profile
after insert on auth.users
for each row
execute procedure public.ensure_manager_profile();


