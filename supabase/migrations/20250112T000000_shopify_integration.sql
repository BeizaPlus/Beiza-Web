-- Shopify Integration Tables

-- Shopify Products: Maps local offerings/memoirs to Shopify product IDs
create table if not exists public.shopify_products (
  id uuid primary key default gen_random_uuid(),
  local_type text not null check (local_type in ('offering', 'memoir', 'physical_product')),
  local_id uuid, -- references memoir_id or offering_id (flexible)
  shopify_product_id bigint not null unique,
  shopify_variant_id bigint,
  product_type text not null check (product_type in ('physical', 'digital')),
  product_category text check (product_category in ('coffin', 'photo_book', 'memorabilia', 'tribute', 'archive', 'memory_page')),
  source_memoir_id uuid references public.memoirs(id) on delete set null, -- for photo books/memorabilia derived from memoirs
  sync_status text not null default 'synced' check (sync_status in ('pending', 'syncing', 'synced', 'error')),
  last_synced_at timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shopify_products_local_idx on public.shopify_products (local_type, local_id);
create index if not exists shopify_products_memoir_idx on public.shopify_products (source_memoir_id);
create index if not exists shopify_products_shopify_id_idx on public.shopify_products (shopify_product_id);

-- Shopify Orders: Tracks orders from Shopify
create table if not exists public.shopify_orders (
  id uuid primary key default gen_random_uuid(),
  shopify_order_id bigint not null unique,
  order_number text not null unique,
  customer_email text not null,
  customer_name text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  order_type text not null default 'order' check (order_type in ('order', 'pre_order')),
  total_amount numeric(10, 2) not null,
  line_items jsonb not null default '[]',
  shipping_address jsonb,
  order_data jsonb not null default '{}',
  last_email_sent_at timestamptz,
  last_email_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shopify_orders_email_idx on public.shopify_orders (customer_email);
create index if not exists shopify_orders_status_idx on public.shopify_orders (status);
create index if not exists shopify_orders_order_number_idx on public.shopify_orders (order_number);

-- Shopify Sync Log: Audit trail for sync operations
create table if not exists public.shopify_sync_log (
  id uuid primary key default gen_random_uuid(),
  operation_type text not null check (operation_type in ('create', 'update', 'delete', 'sync')),
  entity_type text not null,
  entity_id uuid,
  status text not null check (status in ('success', 'error', 'pending')),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists shopify_sync_log_entity_idx on public.shopify_sync_log (entity_type, entity_id);
create index if not exists shopify_sync_log_status_idx on public.shopify_sync_log (status, created_at);

-- Shopify Settings: Store configuration
create table if not exists public.shopify_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Shopify Digital Assets: Maps digital products to downloadable files
create table if not exists public.shopify_digital_assets (
  id uuid primary key default gen_random_uuid(),
  shopify_product_id bigint not null,
  order_id uuid references public.shopify_orders(id) on delete cascade,
  asset_type text not null check (asset_type in ('tribute', 'archive', 'memory_page')),
  file_url text not null, -- Supabase storage path
  download_token uuid not null unique default gen_random_uuid(),
  download_count integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shopify_digital_assets_order_idx on public.shopify_digital_assets (order_id);
create index if not exists shopify_digital_assets_token_idx on public.shopify_digital_assets (download_token);
create index if not exists shopify_digital_assets_product_idx on public.shopify_digital_assets (shopify_product_id);

-- Timestamps
create trigger set_timestamp
before update on public.shopify_products
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.shopify_orders
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.shopify_settings
for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp
before update on public.shopify_digital_assets
for each row execute procedure public.trigger_set_timestamp();

-- RLS Policies

alter table public.shopify_products enable row level security;
drop policy if exists "Managers manage shopify products" on public.shopify_products;
create policy "Managers manage shopify products"
  on public.shopify_products
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.shopify_orders enable row level security;
drop policy if exists "Managers view all orders" on public.shopify_orders;
create policy "Managers view all orders"
  on public.shopify_orders
  for select using (public.is_manager());
drop policy if exists "Managers manage orders" on public.shopify_orders;
create policy "Managers manage orders"
  on public.shopify_orders
  for update using (public.is_manager()) with check (public.is_manager());
-- Customers can view their own orders via email verification (handled in application logic)

alter table public.shopify_sync_log enable row level security;
drop policy if exists "Managers view sync log" on public.shopify_sync_log;
create policy "Managers view sync log"
  on public.shopify_sync_log
  for select using (public.is_manager());

alter table public.shopify_settings enable row level security;
drop policy if exists "Managers manage shopify settings" on public.shopify_settings;
create policy "Managers manage shopify settings"
  on public.shopify_settings
  for all using (public.is_manager()) with check (public.is_manager());

alter table public.shopify_digital_assets enable row level security;
drop policy if exists "Managers manage digital assets" on public.shopify_digital_assets;
create policy "Managers manage digital assets"
  on public.shopify_digital_assets
  for all using (public.is_manager()) with check (public.is_manager());
-- Download access is handled via token verification (no RLS policy needed for public access)

-- Seed initial settings
insert into public.shopify_settings (key, value)
values ('store_domain', '{}'::jsonb)
on conflict (key) do nothing;

insert into public.shopify_settings (key, value)
values ('webhook_secret', '{}'::jsonb)
on conflict (key) do nothing;

