-- Create security definer function for email validation during authentication
-- This function bypasses RLS to allow unauthenticated users to check if they can authenticate
-- Returns: 'allowed' if email can authenticate, 'not_authorized' if email not in manager_profiles, 'first_user' if no managers exist

create or replace function public.can_authenticate_email(check_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  email_count integer;
  manager_count integer;
  normalized_email text;
begin
  -- Normalize email
  normalized_email := lower(trim(check_email));
  
  -- Check if any managers exist
  select count(*) into manager_count
  from public.manager_profiles;
  
  -- If no managers exist, allow first user
  if manager_count = 0 then
    return 'first_user';
  end if;
  
  -- Check if email exists in manager_profiles
  select count(*) into email_count
  from public.manager_profiles
  where email = normalized_email;
  
  -- If email exists, allow authentication
  if email_count > 0 then
    return 'allowed';
  end if;
  
  -- Email not found and managers exist - not authorized
  return 'not_authorized';
end;
$$;

-- Grant execute permission only to anon role (unauthenticated users)
grant execute on function public.can_authenticate_email(text) to anon;

comment on function public.can_authenticate_email is 'Secure function for unauthenticated users to check if an email can authenticate. Returns: "allowed" if email in manager_profiles, "first_user" if no managers exist, "not_authorized" otherwise.';

