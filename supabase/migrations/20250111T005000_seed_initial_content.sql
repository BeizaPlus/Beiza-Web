insert into public.hero_sections (slug, heading, subheading, cta_label, cta_href, background_media, is_published, published_at)
values (
  'landing-hero',
  'Crafting Meaningful Farewells',
  'We believe farewells are not the end — they''re the final chapter of love. Every ceremony, every detail, every design is our way of saying: Thank you for a life well lived!',
  'Create a Memoir',
  '/contact#hero',
  jsonb_build_object(
    'src', 'https://framerusercontent.com/images/ZwPzi3XEJV1BavrysIhb7QSOE0.jpg?width=4680&height=3120',
    'alt', 'Memorial scene with family celebrating a life well lived'
  ),
  true,
  now()
)
on conflict (slug) do update
set heading = excluded.heading,
    subheading = excluded.subheading,
    cta_label = excluded.cta_label,
    cta_href = excluded.cta_href,
    background_media = excluded.background_media,
    is_published = excluded.is_published,
    published_at = excluded.published_at,
    updated_at = now();

insert into public.offerings (title, description, icon_key, display_order, is_published)
values
  ('Branding', 'Visual identity, themes, and full coordination — from color palette to ceremony flow, designed for distinction.', 'palette', 1, true),
  ('Tributes', 'Cinematic storytelling through video, photography, and written memoirs that capture every emotion.', 'heart', 2, true),
  ('Printed Brochures & Keepsakes', 'Elegant brochures, thank-you cards, and keepsakes crafted with premium paper and timeless finishes.', 'file-text', 3, true),
  ('Screens', 'LED installations and stage visuals that turn farewells into immersive, high-definition experiences.', 'monitor', 4, true),
  ('Coffins', 'Signature handcrafted pieces that embody dignity, culture, and craftsmanship.', 'box', 5, true),
  ('Legacy', 'Online memorials, digital biographies, and preserved archives that keep every story alive forever.', 'cloud', 6, true)
on conflict (title) do update
set description = excluded.description,
    icon_key = excluded.icon_key,
    display_order = excluded.display_order,
    is_published = excluded.is_published,
    updated_at = now();

insert into public.testimonials (quote, author, role, surfaces, is_published)
values
  ('Beiza captured every detail with empathy. Our celebration felt true to my mother’s spirit.', 'Adwoa Mensah', 'Daughter', array['landing', 'contact'], true),
  ('From the first call to the final farewell, the team handled everything with grace.', 'Michael Ofori', 'Brother', array['landing'], true),
  ('The digital memoir meant relatives abroad could experience the tribute in full.', 'Senam Amegashie', 'Family Archivist', array['landing'], true),
  ('Guests still talk about the stage design and live screens. It was breathtaking.', 'Eunice Amponsah', 'Event Partner', array['landing', 'services'], true),
  ('Their printed keepsakes are heirlooms we’ll share with future generations.', 'Samuel Boateng', 'Grandson', array['landing'], true),
  ('The tribute film helped us laugh, cry, and remember together. It was healing.', 'Vida Akua', 'Family Friend', array['landing'], true),
  ('They translated our ideas into a deeply personal remembrance. Every guest felt included and uplifted.', 'Ama K. Boadu', 'Celebration Planner', array['contact'], true),
  ('Coordinating across continents felt effortless. Beiza handled the live stream and archive flawlessly.', 'Kojo Adjei', 'Family Historian', array['contact'], true),
  ('Their team listened, created, and supported us like family. The tribute film still brings tears of joy.', 'Naomi Afriyie', 'Daughter', array['contact'], true),
  ('The Beiza team orchestrated every moment — from the prelude visuals to the final blessing — with stunning precision.', 'Pastor Samuel Owusu', 'Officiant', array['services'], true),
  ('Their stage design and live screen direction made a 400-seat cathedral feel intimate for our family.', 'Harriet Twum', 'Head of Protocol', array['services'], true),
  ('Relatives overseas watched live, signed the digital tribute wall, and felt present thanks to Beiza''s streaming team.', 'Daniel Osei', 'Cousin', array['services'], true)
on conflict (quote) do update
set author = excluded.author,
    role = excluded.role,
    surfaces = excluded.surfaces,
    is_published = excluded.is_published,
    updated_at = now();

insert into public.faqs (question, answer, display_order, is_published)
values
  ('What do I need to begin planning a Beiza TV farewell?', 'Start with your loved one’s story. We’ll guide you through gathering photos, milestones, and the voices of family and friends to build a meaningful narrative.', 1, true),
  ('How do I know if I’m ready to plan with Beiza TV?', 'If you’re seeking a celebration that feels personal and thoughtfully produced, we’ll meet you where you are, even if all you have is a desire to honor their legacy.', 2, true),
  ('Can I plan with Beiza TV if I’m not in Ghana?', 'Yes. Our team works across time zones with remote production, live streaming, and digital Keepsakes so every relative can participate.', 3, true),
  ('How long does the planning process take?', 'Most tributes take 10 to 21 days depending on the scope. We adjust timelines to align with the family’s schedule and rites.', 4, true),
  ('What kind of events do you curate?', 'We support memorials, celebration services, homegoings, and legacy unveilings — from intimate gatherings to multi-day productions.', 5, true)
on conflict (question) do update
set answer = excluded.answer,
    display_order = excluded.display_order,
    is_published = excluded.is_published,
    updated_at = now();

insert into public.pricing_tiers (name, tagline, price_label, description, badge_label, is_recommended, is_published, display_order)
values
  ('Lite', 'Starting at', 'GHS 8,500', 'Story consultation, tribute film up to 5 minutes, on-site media crew, memorial microsite, and 30-day streaming replay.', null, false, true, 1),
  ('Signature', 'Starting at', 'GHS 15,000', 'Everything in Lite plus full ceremony direction, multi-camera broadcast, LED visual design, and printed keepsakes.', 'Featured', true, true, 2),
  ('Legacy', 'Starting at', 'Custom', 'For multi-day celebrations, cross-border coordination, and archival projects that preserve decades of family history.', null, false, true, 3)
on conflict (name) do update
set tagline = excluded.tagline,
    price_label = excluded.price_label,
    description = excluded.description,
    badge_label = excluded.badge_label,
    is_recommended = excluded.is_recommended,
    is_published = excluded.is_published,
    display_order = excluded.display_order,
    updated_at = now();

insert into public.pricing_features (tier_id, label, display_order)
select pt.id, f.feature, f.ord
from public.pricing_tiers pt
join (values
  ('Lite', 'Single location coverage', 1),
  ('Lite', 'Digital guestbook setup', 2),
  ('Lite', 'Keepsake highlight reel', 3),
  ('Signature', 'Program design & printing', 1),
  ('Signature', 'Live stream with moderation', 2),
  ('Signature', 'Personalised stage backdrop', 3),
  ('Legacy', 'Ancestral archive production', 1),
  ('Legacy', 'Heritage documentary series', 2),
  ('Legacy', 'Heirloom book & gallery installation', 3)
) as f(tier_name, feature, ord)
  on pt.name = f.tier_name
on conflict (tier_id, label) do nothing;

insert into public.services (title, description, icon_key, display_order, is_published)
values
  ('Memorial Tributes', 'Immersive narrative films, interactive biographies, and live storytelling that honour a life with cinematic detail.', 'book-heart', 1, true),
  ('Photo Books', 'Curated coffee-table keepsakes, hand bound with archival paper and personalised layouts for every chapter.', 'camera', 2, true),
  ('Legacy Archives', 'Digital vaults, family trees, and oral history repositories that preserve lineage for future generations.', 'archive', 3, true),
  ('Event Direction', 'Full-service planning, rehearsal, and execution – from venue styling to program flow and guest experience.', 'calendar', 4, true),
  ('Stage & Screens', 'LED installations, live camera feeds, and bespoke visuals that immerse guests in every moment.', 'monitor', 5, true),
  ('Signature Pieces', 'Custom coffins, memory tables, and ceremonial accessories handcrafted with dignified finishes.', 'box', 6, true)
on conflict (title) do update
set description = excluded.description,
    icon_key = excluded.icon_key,
    display_order = excluded.display_order,
    is_published = excluded.is_published,
    updated_at = now();

insert into public.process_steps (step_number, title, description, is_published)
values
  (1, 'Discovery', 'We listen, research, and collect the milestones, artefacts, and sentiments that define your loved one''s journey.', true),
  (2, 'Design', 'Our team maps the narrative, visuals, and guest experience with storyboards, moodboards, and production cues.', true),
  (3, 'Production', 'Cinematographers, editors, designers, and stage directors craft the tribute, keeping families looped in every stage.', true),
  (4, 'Celebration', 'We stage, stream, archive, and support on the day — ensuring the farewell feels seamless and unforgettable.', true)
on conflict (step_number) do update
set title = excluded.title,
    description = excluded.description,
    is_published = excluded.is_published,
    updated_at = now();

insert into public.events (slug, title, location, occurs_on, hero_media, description, is_featured, is_published)
values (
  'monica-manu',
  'The Life of Madam Monica Manu',
  'Accra, Ghana',
  '2025-06-18',
  jsonb_build_object(
    'src', 'https://framerusercontent.com/images/hOxvbbCIefKg5M5GXOo8yBqATo.png?width=799&height=823',
    'alt', 'Joyful woman with smartphone'
  ),
  'A full-scale celebration blending live performances, immersive visuals, and digital archives.',
  true,
  true
)
on conflict (slug) do update
set title = excluded.title,
    location = excluded.location,
    occurs_on = excluded.occurs_on,
    hero_media = excluded.hero_media,
    description = excluded.description,
    is_featured = excluded.is_featured,
    is_published = excluded.is_published,
    updated_at = now();

insert into public.event_media (event_id, media, display_order)
select id, jsonb_build_object(
  'src', 'https://framerusercontent.com/images/hOxvbbCIefKg5M5GXOo8yBqATo.png?width=799&height=823',
  'alt', 'Joyful woman with smartphone'
), 1
from public.events
where slug = 'monica-manu'
on conflict (event_id, display_order) do nothing;

insert into public.contact_channels (channel_type, label, value, display_order, is_published)
values
  ('phone', 'Phone', '+233 55 900 0111', 1, true),
  ('email', 'Email', 'hello@beiza.tv', 2, true),
  ('external', 'Book a discovery call', 'https://calendly.com', 3, true)
on conflict (channel_type, value) do update
set label = excluded.label,
    display_order = excluded.display_order,
    is_published = excluded.is_published,
    updated_at = now();

insert into public.packages (name, description, price_label, is_published, display_order)
values
  ('Lite', 'Tribute essentials for intimate gatherings.', 'GHS 8,500', true, 1),
  ('Standard', 'Expanded coverage with on-site production support.', 'GHS 12,500', true, 2),
  ('Signature', 'Full ceremony direction, stage design, and live streaming.', 'GHS 15,000', true, 3)
on conflict (name) do update
set description = excluded.description,
    price_label = excluded.price_label,
    is_published = excluded.is_published,
    display_order = excluded.display_order,
    updated_at = now();

insert into public.navigation_links (label, href, location, display_order, is_published)
values
  ('Live Now', '/', 'primary', 1, true),
  ('Events', '/events', 'primary', 2, true),
  ('Gallery', '/gallery', 'primary', 3, true),
  ('Memoirs', '/memoirs', 'primary', 4, true),
  ('Contact', '/contact', 'primary', 5, true)
on conflict (label, location) do update
set href = excluded.href,
    display_order = excluded.display_order,
    is_published = excluded.is_published,
    updated_at = now();

insert into public.footer_links (label, href, group_label, display_order, is_published)
values
  ('About Us', '/#about', 'Sections', 1, true),
  ('Memoirs', '/memoirs', 'Sections', 2, true),
  ('Tributes', '/gallery', 'Sections', 3, true),
  ('Contact', '/contact#hero', 'Sections', 4, true)
on conflict (label, group_label) do update
set href = excluded.href,
    display_order = excluded.display_order,
    is_published = excluded.is_published,
    updated_at = now();

insert into public.site_settings (key, value, description)
values
  ('business_name', 'Beiza Plus', 'Full business name'),
  ('phone_primary', '+233 55 900 0111', 'Primary phone number'),
  ('email_primary', 'hello@beiza.tv', 'Primary contact email'),
  ('calendly_url', 'https://calendly.com', 'Calendly scheduling link'),
  ('instagram_url', 'https://instagram.com/beizaplus', 'Instagram'),
  ('facebook_url', 'https://facebook.com/beizaplus', 'Facebook'),
  ('tiktok_url', 'https://tiktok.com/@beizaplus', 'TikTok'),
  ('youtube_url', 'https://youtube.com/@beizaplus', 'YouTube')
on conflict (key) do update
set value = excluded.value,
    description = excluded.description,
    updated_at = now();

insert into public.memoirs (slug, title, subtitle, summary, hero_media, status, last_published_at)
values (
  'monica-manu',
  'The life of Madam Monica Manu',
  'A matriarch whose faith, generosity, and entrepreneurial spark inspired a community spanning generations.',
  'Walk through the Monica Manu celebration to see how we transform memories into immersive experiences.',
  jsonb_build_object(
    'src', 'https://framerusercontent.com/images/YRsXM0Ss8CIUK02VdEkSJYDNdHU.png?width=1658&height=1151',
    'alt', 'Celebration of Madam Monica Manu'
  ),
  'published',
  now()
)
on conflict (slug) do update
set title = excluded.title,
    subtitle = excluded.subtitle,
    summary = excluded.summary,
    hero_media = excluded.hero_media,
    status = excluded.status,
    last_published_at = excluded.last_published_at,
    updated_at = now();

insert into public.memoir_sections (memoir_id, section_type, heading, body, display_order)
select id, 'narrative', null, paragraph, ord
from public.memoirs
join (values
  (1, 'Madam Monica Manu, affectionately known as Auntie Monica, was born in 1954 in Kumasi, Ghana. She lived a life of devotion, service, and love that spanned seventy-one remarkable years until her peaceful passing on the 6th of June, 2025.'),
  (2, 'She began her education at Achiase near Asuofua and later trained at Mancels Commercial and Business School. Although she studied sewing, Monica’s entrepreneurial spirit led her into the world of vibrant marketplaces where she built a reputable trading career.'),
  (3, 'Soon after completing her education she married Mr. Joseph Lawrence Asiwbour — Teacher Asiwbour — and together they raised six children. Their union was marked by mutual respect, faith, and dedication to family life, travelling whenever his calling took a new direction.'),
  (4, 'Monica was a pillar in her community; prayerful, fair, and full of warmth. Her home was a sanctuary of hospitality and strength, welcoming relatives from near and far, guiding them with wise counsel, and holding space for every generation.')
) as bio(ord, paragraph)
  on true
where memoirs.slug = 'monica-manu'
on conflict do nothing;

insert into public.memoir_highlights (memoir_id, media, caption, display_order)
select m.id, media, caption, ord
from public.memoirs m
join (values
  (
    1,
    jsonb_build_object('src', 'https://framerusercontent.com/images/YRsXM0Ss8CIUK02VdEkSJYDNdHU.png?width=1658&height=1151', 'alt', 'Agya Koo performing live at the farewell of Madam Monica Manu.'),
    'Agya Koo performing live at the farewell of Madam Monica Manu.'
  ),
  (
    2,
    jsonb_build_object('src', 'https://framerusercontent.com/images/hOuECFey8F4ua6LAYVX7DHPnQ.png?width=1684&height=1140', 'alt', 'Mourners in red and black at the farewell of Madam Monica Manu.'),
    'Mourners in red and black at the farewell of Madam Monica Manu.'
  ),
  (
    3,
    jsonb_build_object('src', 'https://framerusercontent.com/images/xsBNx9mI9Ew3pAqs1HZ9ywLrp0.png?width=1741&height=1153', 'alt', 'Moments of song and remembrance for Madam Monica Manu.'),
    'Moments of song and remembrance for Madam Monica Manu.'
  )
) as highlights(ord, media, caption)
  on true
where m.slug = 'monica-manu'
on conflict do nothing;

insert into public.memoir_tributes (memoir_id, name, relationship, message, display_order)
select m.id, name, relationship, message, ord
from public.memoirs m
join (values
  ('Mercy Asiwbour', 'Daughter', 'You held our family together with grace. Your prayers continue to light the way for us all.', 1),
  ('Samuel & Georgina', 'Grandchildren', 'Grandma, your songs still echo in the house. We promise to keep your storytelling alive.', 2),
  ('Teacher Asiwbour', 'Husband', 'For five decades you stood by me. Rest, my love, knowing your legacy lives on in every heart you touched.', 3),
  ('Grace and family', 'Family Friend', 'Your hospitality welcomed us at every celebration. We cherish the memories of your radiant smile.', 4),
  ('Kwadwo & Afua', 'In-law', 'Thank you for showing us what humility, strength, and unwavering faith truly look like.', 5),
  ('The All Nations Choir', 'Choir', 'We will sing your favourite hymns in your honour, as you always requested with joyful tears.', 6)
) as tributes(name, relationship, message, ord)
  on true
where m.slug = 'monica-manu'
on conflict do nothing;

insert into public.memoir_timelines (
  memoir_id,
  memoir_slug,
  era_label,
  title,
  excerpt,
  story_url,
  timestamp,
  end_timestamp,
  location,
  tags,
  participants,
  image,
  audio_clip_url,
  is_published,
  display_order
)
select m.id,
       m.slug,
       timeline.era,
       timeline.title,
       timeline.excerpt,
       timeline.story_url,
       timeline.start_date::date,
       timeline.end_date::date,
       timeline.location,
       timeline.tags,
       timeline.participants,
       timeline.image,
       timeline.audio,
       true,
       timeline.display_order
from public.memoirs m
join (
  values
    (
      'Early Years',
      'Rooted in Kumasi',
      'Monica’s childhood was filled with the hum of marketplaces and evenings spent listening to hymns with her parents.',
      null,
      '1958-03-01',
      null,
      'Kumasi, Ghana',
      array['family', 'childhood'],
      array['Parents', 'Siblings'],
      jsonb_build_object(
        'src', 'https://framerusercontent.com/images/YRsXM0Ss8CIUK02VdEkSJYDNdHU.png?width=1658&height=1151',
        'alt', 'A young Monica Manu smiling under the Ghanaian sun.'
      ),
      null,
      1
    ),
    (
      'Entrepreneurial Rise',
      'Mastering the Market',
      'She transformed her sewing discipline into a thriving trade, building a reputation for fairness and generosity.',
      null,
      '1976-07-18',
      null,
      'Kumasi Central Market',
      array['entrepreneurship'],
      array['Fellow traders'],
      jsonb_build_object(
        'src', 'https://framerusercontent.com/images/hOuECFey8F4ua6LAYVX7DHPnQ.png?width=1684&height=1140',
        'alt', 'Market stalls decorated in vibrant kente fabrics.'
      ),
      null,
      2
    ),
    (
      'Legacy & Faith',
      'A Home of Welcome',
      'Her living room became a refuge where prayer circles, storytelling, and mentorship bound the family together.',
      null,
      '2004-11-06',
      null,
      'Family home, Ghana',
      array['faith', 'family', 'community'],
      array['Children', 'Grandchildren'],
      jsonb_build_object(
        'src', 'https://framerusercontent.com/images/xsBNx9mI9Ew3pAqs1HZ9ywLrp0.png?width=1741&height=1153',
        'alt', 'Family gathered for a heartfelt hymn session.'
      ),
      null,
      3
    )
) as timeline(era, title, excerpt, story_url, start_date, end_date, location, tags, participants, image, audio, display_order)
  on true
where m.slug = 'monica-manu'
on conflict (memoir_id, title) do nothing;

