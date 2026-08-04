-- ============================================================================
-- abdmall — 01. Catalogue
-- Enums, categories, products, full-text search, and public-read RLS.
-- Mirrors the shapes in src/lib/mock-data.ts so the frontend swaps 1:1.
-- ============================================================================

create extension if not exists pgcrypto; -- gen_random_uuid()

-- Shared trigger to keep updated_at fresh on any row update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create type public.product_badge as enum ('new', 'deal', 'bestseller');

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  tagline    text,
  hue        text[],          -- two-stop gradient used by the UI tiles
  image_url  text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  category_id   uuid not null references public.categories (id) on delete restrict,
  price         integer not null check (price >= 0),       -- whole naira (kobo x100 at Paystack call)
  old_price     integer check (old_price > price),         -- optional strike-through price
  stock         integer not null default 0 check (stock >= 0),
  badge         public.product_badge,
  rating        numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  review_count  integer not null default 0 check (review_count >= 0),
  sold_count    integer not null default 0 check (sold_count >= 0),
  image_url     text,
  swatch        text[],                                    -- gradient fallback when no photo
  blurb         text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Server-side search index over name + blurb (powers /shop?q=).
  search_vector tsvector generated always as (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(blurb, ''))
  ) stored
);

create index products_category_idx on public.products (category_id);
create index products_search_idx   on public.products using gin (search_vector);
-- Partial index to list deals quickly (products with a strike price).
create index products_deals_idx     on public.products (id) where old_price is not null;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — catalogue is public-read, never public-write.
-- Merchant writes happen via the service role (Studio / server), which
-- bypasses RLS, so there are deliberately no insert/update/delete policies.
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products   enable row level security;

create policy "Categories are readable by everyone"
  on public.categories for select
  using (true);

create policy "Active products are readable by everyone"
  on public.products for select
  using (is_active);
