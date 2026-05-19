-- Footer tagline editable from site_settings (admin / Supabase dashboard)
insert into public.site_settings (key, value, description)
values
  (
    'footer_tagline',
    'We design meaningful legacies — handcrafted records that celebrate life, culture, and family.',
    'Tagline shown in the site footer'
  ),
  (
    'footer_copyright_suffix',
    'Crafted with care, made to remember.',
    'Suffix line after copyright year in the footer'
  )
on conflict (key) do update
set value = excluded.value,
    description = excluded.description,
    updated_at = now();
