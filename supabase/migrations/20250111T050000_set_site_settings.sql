-- Set initial site settings values
-- This migration ensures all site settings are set with default values
-- It uses ON CONFLICT to make it idempotent (safe to run multiple times)

insert into public.site_settings (key, value, description)
values
  ('business_name', 'Beiza Plus', 'Full business name'),
  ('phone_primary', '+233 55 900 0111', 'Primary phone number'),
  ('email_primary', 'hello@beiza.tv', 'Primary contact email'),
  ('calendly_url', 'https://calendly.com', 'Calendly scheduling link'),
  ('instagram_url', 'https://instagram.com/beizaplus', 'Instagram profile URL'),
  ('facebook_url', 'https://facebook.com/beizaplus', 'Facebook page URL'),
  ('tiktok_url', 'https://tiktok.com/@beizaplus', 'TikTok profile URL'),
  ('youtube_url', 'https://youtube.com/@beizaplus', 'YouTube channel URL')
on conflict (key) do update
set value = excluded.value,
    description = excluded.description,
    updated_at = now();

