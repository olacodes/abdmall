-- ---------------------------------------------------------------------------
-- Shop settings — the handful of values the owner needs to change without a
-- deploy: where transfers go, how to reach the shop, what delivery costs.
--
-- One row, enforced by the primary key being a boolean that must be true. No
-- insert or delete policy exists, so the seeded row below is the only row
-- there will ever be and no caller has to ask "which settings?".
--
-- Readable by everyone on purpose: the bank details are printed on the
-- checkout page and the WhatsApp number on every page. Writable by admins
-- only.
-- ---------------------------------------------------------------------------
create table if not exists public.shop_settings (
  id                      boolean primary key default true,

  -- Direct bank transfer destination. The account number is the highest-stakes
  -- value in this table: a wrong digit sends customers' money to a stranger
  -- and nothing anywhere would notice, so it is shape-checked here as well as
  -- confirmed in the admin form.
  bank_account_name       text not null,
  bank_account_number     text not null,
  bank_name               text not null,

  -- International form, digits only — what wa.me expects.
  whatsapp_number         text not null,

  -- Nullable: no value exists for these yet, and a placeholder masquerading as
  -- a real contact is worse than showing nothing.
  support_email           text,
  support_phone           text,

  -- Whole naira, matching products.price.
  delivery_fee            integer not null,
  free_delivery_threshold integer not null,

  updated_at              timestamptz not null default now(),
  updated_by              uuid references auth.users (id) on delete set null,

  constraint shop_settings_single_row
    check (id),
  constraint shop_settings_account_number_check
    check (bank_account_number ~ '^[0-9]{10}$'),
  constraint shop_settings_whatsapp_check
    check (whatsapp_number ~ '^[0-9]{10,15}$'),
  constraint shop_settings_delivery_fee_check
    check (delivery_fee >= 0),
  constraint shop_settings_threshold_check
    check (free_delivery_threshold >= 0)
);

-- ---------------------------------------------------------------------------
-- Stamp the audit columns in the database rather than trusting the caller to
-- send them — an admin editing their own `updated_by` is pointless, but so is
-- relying on every future call site to remember.
-- ---------------------------------------------------------------------------
create or replace function public.touch_shop_settings()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  return new;
end;
$$;

drop trigger if exists shop_settings_touch on public.shop_settings;
create trigger shop_settings_touch
  before update on public.shop_settings
  for each row execute function public.touch_shop_settings();

-- ---------------------------------------------------------------------------
-- Seed. Values match what was hardcoded at the time of writing, so nothing
-- changes on the storefront the moment this lands. Inserted as the migration
-- owner, which is why no insert policy is needed — or wanted.
-- ---------------------------------------------------------------------------
insert into public.shop_settings (
  bank_account_name, bank_account_number, bank_name,
  whatsapp_number, delivery_fee, free_delivery_threshold
)
values (
  'ABDMALL MARKET', '1999708746', 'Access Bank',
  '2349037335409', 1500, 100000
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- RLS. Read is open; write is admin-only. There is deliberately no insert or
-- delete policy, so the single row cannot be removed or duplicated through
-- the API.
-- ---------------------------------------------------------------------------
alter table public.shop_settings enable row level security;

drop policy if exists "Shop settings are readable by everyone" on public.shop_settings;
create policy "Shop settings are readable by everyone"
  on public.shop_settings for select
  using (true);

drop policy if exists "Admins can update shop settings" on public.shop_settings;
create policy "Admins can update shop settings"
  on public.shop_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
