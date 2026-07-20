-- Ecom catalog schema + RLS
-- anon: SELECT published products and related data
-- authenticated: full access

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  parent_id text references public.categories (id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.brands (
  id text primary key,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.products (
  id text primary key,
  name text not null,
  slug text not null unique,
  model text not null,
  brand_id text not null references public.brands (id) on delete restrict,
  category_id text not null references public.categories (id) on delete restrict,
  price numeric(14, 0) not null check (price >= 0),
  sale_price numeric(14, 0) check (sale_price is null or sale_price >= 0),
  stock_status text not null check (
    stock_status in ('in_stock', 'out_of_stock', 'discontinued')
  ),
  sold_count integer not null default 0 check (sold_count >= 0),
  warranty text not null,
  origin text not null,
  motor text,
  specs jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id text primary key,
  product_id text not null references public.products (id) on delete cascade,
  url text not null,
  alt text not null default '',
  sort_order integer not null default 0
);

create table public.leads (
  id text primary key default gen_random_uuid()::text,
  product_id text references public.products (id) on delete set null,
  name text not null,
  phone text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index idx_categories_slug on public.categories (slug);
create index idx_brands_slug on public.brands (slug);
create index idx_products_slug on public.products (slug);
create index idx_products_brand_id on public.products (brand_id);
create index idx_products_category_id on public.products (category_id);
create index idx_products_price on public.products (price);
create index idx_product_images_product_id on public.product_images (product_id);
create index idx_leads_product_id on public.leads (product_id);
create index idx_leads_created_at on public.leads (created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.leads enable row level security;

-- Categories / brands: public read (filter sidebar)
create policy "anon_select_categories"
  on public.categories for select
  to anon
  using (true);

create policy "anon_select_brands"
  on public.brands for select
  to anon
  using (true);

-- Published products only for anon
create policy "anon_select_published_products"
  on public.products for select
  to anon
  using (is_published = true);

-- Images of published products
create policy "anon_select_published_product_images"
  on public.product_images for select
  to anon
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_images.product_id
        and p.is_published = true
    )
  );

-- Storefront lead capture
create policy "anon_insert_leads"
  on public.leads for insert
  to anon
  with check (true);

-- Authenticated: full access on all tables
create policy "authenticated_all_categories"
  on public.categories for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated_all_brands"
  on public.brands for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated_all_products"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated_all_product_images"
  on public.product_images for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated_all_leads"
  on public.leads for all
  to authenticated
  using (true)
  with check (true);
