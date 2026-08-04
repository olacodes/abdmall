-- ============================================================================
-- abdmall — 03. Orders
-- The security-critical tables. Orders are created and marked paid ONLY by the
-- server (service role, after Paystack verification). Clients can read their
-- own orders but can never write one — that's the "never trust the device" rule
-- from the product document, enforced at the database.
-- ============================================================================

create type public.order_status as enum
  ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled');

-- ---------------------------------------------------------------------------
-- Orders — delivery details are snapshotted onto the order.
-- user_id is null for guest checkout.
-- ---------------------------------------------------------------------------
create table public.orders (
  id                 uuid primary key default gen_random_uuid(),
  reference          text not null unique,          -- customer-facing ref, e.g. ABD-LQ8F3K-7420
  user_id            uuid references auth.users (id) on delete set null, -- null = guest
  email              text not null,
  full_name          text not null,
  phone              text not null,
  address_line       text not null,
  city               text not null,
  state              text not null,
  status             public.order_status not null default 'pending',
  subtotal           integer not null check (subtotal >= 0),
  delivery_fee       integer not null default 0 check (delivery_fee >= 0),
  total              integer not null check (total >= 0),
  payment_method     text,                          -- 'card' | 'transfer'
  paystack_reference text unique,                   -- set when payment is initialised
  paid_at            timestamptz,                   -- set only after server verification
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index orders_user_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Order items — name/price/image snapshotted at purchase, so later catalogue
-- edits never rewrite history. product_id kept nullable for the same reason.
-- ---------------------------------------------------------------------------
create table public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  name       text not null,
  price      integer not null check (price >= 0),
  image_url  text,
  size       text,
  quantity   integer not null check (quantity > 0)
);
create index order_items_order_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- RLS — signed-in customers read only their own orders.
-- No insert/update/delete policies exist on purpose: all writes go through the
-- service role on the server after Paystack verification. Guest orders are
-- fetched by reference server-side, so they need no client policy either.
-- ---------------------------------------------------------------------------
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

create policy "Users can view their own orders"
  on public.orders for select
  using ((select auth.uid()) = user_id);

create policy "Users can view items of their own orders"
  on public.order_items for select
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = (select auth.uid())
  ));
