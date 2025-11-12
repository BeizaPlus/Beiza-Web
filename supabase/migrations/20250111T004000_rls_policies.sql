-- Enable RLS and policies for content tables
alter table public.hero_sections enable row level security;
drop policy if exists "Public hero sections" on public.hero_sections;
create policy "Public hero sections"
  on public.hero_sections
  for select using (is_published);
drop policy if exists "Managers manage hero sections" on public.hero_sections;
create policy "Managers manage hero sections"
  on public.hero_sections
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.offerings enable row level security;
drop policy if exists "Public offerings" on public.offerings;
create policy "Public offerings"
  on public.offerings
  for select using (is_published);
drop policy if exists "Managers manage offerings" on public.offerings;
create policy "Managers manage offerings"
  on public.offerings
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.testimonials enable row level security;
drop policy if exists "Public testimonials" on public.testimonials;
create policy "Public testimonials"
  on public.testimonials
  for select using (is_published);
drop policy if exists "Managers manage testimonials" on public.testimonials;
create policy "Managers manage testimonials"
  on public.testimonials
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.faqs enable row level security;
drop policy if exists "Public faqs" on public.faqs;
create policy "Public faqs"
  on public.faqs
  for select using (is_published);
drop policy if exists "Managers manage faqs" on public.faqs;
create policy "Managers manage faqs"
  on public.faqs
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.pricing_tiers enable row level security;
drop policy if exists "Public pricing tiers" on public.pricing_tiers;
create policy "Public pricing tiers"
  on public.pricing_tiers
  for select using (is_published);
drop policy if exists "Managers manage pricing tiers" on public.pricing_tiers;
create policy "Managers manage pricing tiers"
  on public.pricing_tiers
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.pricing_features enable row level security;
drop policy if exists "Public pricing features" on public.pricing_features;
create policy "Public pricing features"
  on public.pricing_features
  for select using (
    exists (
      select 1 from public.pricing_tiers pt
      where pt.id = pricing_features.tier_id
        and pt.is_published
    )
  );
drop policy if exists "Managers manage pricing features" on public.pricing_features;
create policy "Managers manage pricing features"
  on public.pricing_features
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.services enable row level security;
drop policy if exists "Public services" on public.services;
create policy "Public services"
  on public.services
  for select using (is_published);
drop policy if exists "Managers manage services" on public.services;
create policy "Managers manage services"
  on public.services
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.process_steps enable row level security;
drop policy if exists "Public process steps" on public.process_steps;
create policy "Public process steps"
  on public.process_steps
  for select using (is_published);
drop policy if exists "Managers manage process steps" on public.process_steps;
create policy "Managers manage process steps"
  on public.process_steps
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.events enable row level security;
drop policy if exists "Public events" on public.events;
create policy "Public events"
  on public.events
  for select using (is_published);
drop policy if exists "Managers manage events" on public.events;
create policy "Managers manage events"
  on public.events
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.event_media enable row level security;
drop policy if exists "Public event media" on public.event_media;
create policy "Public event media"
  on public.event_media
  for select using (
    exists (
      select 1 from public.events e
      where e.id = event_media.event_id
        and e.is_published
    )
  );
drop policy if exists "Managers manage event media" on public.event_media;
create policy "Managers manage event media"
  on public.event_media
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.contact_channels enable row level security;
drop policy if exists "Public contact channels" on public.contact_channels;
create policy "Public contact channels"
  on public.contact_channels
  for select using (is_published);
drop policy if exists "Managers manage contact channels" on public.contact_channels;
create policy "Managers manage contact channels"
  on public.contact_channels
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.packages enable row level security;
drop policy if exists "Public packages" on public.packages;
create policy "Public packages"
  on public.packages
  for select using (is_published);
drop policy if exists "Managers manage packages" on public.packages;
create policy "Managers manage packages"
  on public.packages
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.package_features enable row level security;
drop policy if exists "Public package features" on public.package_features;
create policy "Public package features"
  on public.package_features
  for select using (
    exists (
      select 1 from public.packages p
      where p.id = package_features.package_id
        and p.is_published
    )
  );
drop policy if exists "Managers manage package features" on public.package_features;
create policy "Managers manage package features"
  on public.package_features
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.navigation_links enable row level security;
drop policy if exists "Public navigation links" on public.navigation_links;
create policy "Public navigation links"
  on public.navigation_links
  for select using (is_published);
drop policy if exists "Managers manage navigation links" on public.navigation_links;
create policy "Managers manage navigation links"
  on public.navigation_links
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.footer_links enable row level security;
drop policy if exists "Public footer links" on public.footer_links;
create policy "Public footer links"
  on public.footer_links
  for select using (is_published);
drop policy if exists "Managers manage footer links" on public.footer_links;
create policy "Managers manage footer links"
  on public.footer_links
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.site_settings enable row level security;
drop policy if exists "Public site settings" on public.site_settings;
create policy "Public site settings"
  on public.site_settings
  for select using (true);
drop policy if exists "Managers manage site settings" on public.site_settings;
create policy "Managers manage site settings"
  on public.site_settings
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.memoirs enable row level security;
drop policy if exists "Public memoirs" on public.memoirs;
create policy "Public memoirs"
  on public.memoirs
  for select using (status = 'published');
drop policy if exists "Managers manage memoirs" on public.memoirs;
create policy "Managers manage memoirs"
  on public.memoirs
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.memoir_sections enable row level security;
drop policy if exists "Public memoir sections" on public.memoir_sections;
create policy "Public memoir sections"
  on public.memoir_sections
  for select using (
    exists (
      select 1 from public.memoirs m
      where m.id = memoir_sections.memoir_id
        and m.status = 'published'
    )
  );
drop policy if exists "Managers manage memoir sections" on public.memoir_sections;
create policy "Managers manage memoir sections"
  on public.memoir_sections
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.memoir_highlights enable row level security;
drop policy if exists "Public memoir highlights" on public.memoir_highlights;
create policy "Public memoir highlights"
  on public.memoir_highlights
  for select using (
    exists (
      select 1 from public.memoirs m
      where m.id = memoir_highlights.memoir_id
        and m.status = 'published'
    )
  );
drop policy if exists "Managers manage memoir highlights" on public.memoir_highlights;
create policy "Managers manage memoir highlights"
  on public.memoir_highlights
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.memoir_tributes enable row level security;
drop policy if exists "Public memoir tributes" on public.memoir_tributes;
create policy "Public memoir tributes"
  on public.memoir_tributes
  for select using (
    exists (
      select 1 from public.memoirs m
      where m.id = memoir_tributes.memoir_id
        and m.status = 'published'
    )
  );
drop policy if exists "Managers manage memoir tributes" on public.memoir_tributes;
create policy "Managers manage memoir tributes"
  on public.memoir_tributes
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.memoir_timelines enable row level security;
drop policy if exists "Public memoir timelines" on public.memoir_timelines;
create policy "Public memoir timelines"
  on public.memoir_timelines
  for select using (is_published);
drop policy if exists "Managers manage memoir timelines" on public.memoir_timelines;
create policy "Managers manage memoir timelines"
  on public.memoir_timelines
  for all using (public.is_manager()) with check (public.is_manager());

