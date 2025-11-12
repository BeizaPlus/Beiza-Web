-- Add hero section content to site settings
-- These settings allow admins to update the landing page hero section

insert into public.site_settings (key, value, description)
values
  ('hero_heading', 'Crafting Meaningful Farewells', 'Main heading for the landing page hero section'),
  ('hero_subheading', 'We believe farewells are not the end — they''re the final chapter of love. Every ceremony, every detail, every design is our way of saying: Thank you for a life well lived!', 'Subheading text for the landing page hero section'),
  ('hero_cta_label', 'Create a Memoir', 'Call-to-action button label for the hero section'),
  ('hero_cta_href', '/contact', 'Call-to-action button link URL'),
  ('hero_background_image', 'https://framerusercontent.com/images/ZwPzi3XEJV1BavrysIhb7QSOE0.jpg?width=4680&height=3120', 'Background image URL for the hero section'),
  ('hero_background_alt', 'Memorial scene with family celebrating a life well lived', 'Alt text for the hero background image'),
  ('hero_reviews', '100+ Positive Client Reviews', 'Reviews text displayed in the hero section')
on conflict (key) do update
set value = excluded.value,
    description = excluded.description,
    updated_at = now();

