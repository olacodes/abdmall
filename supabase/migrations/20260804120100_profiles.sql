-- ============================================================================
-- abdmall — 02. Profiles & saved addresses
-- Extends Supabase Auth users. Guest checkout does NOT require any of this;
-- these tables only serve signed-in customers (order history, saved details).
--
-- Re-runnable: tables/indexes use `if not exists`, functions/triggers use
-- `create or replace`, and policies are dropped-then-created.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  phone      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Saved delivery addresses
-- ---------------------------------------------------------------------------
create table if not exists public.addresses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  full_name    text not null,
  phone        text not null,
  address_line text not null,
  city         text not null,
  state        text not null,
  is_default   boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists addresses_user_idx on public.addresses (user_id);

-- ---------------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth user signs up.
-- security definer + empty search_path is the Supabase-recommended safe pattern.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS — a user can only ever see and manage their own rows.
-- ---------------------------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.addresses enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select using ((select auth.uid()) = id);
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update using ((select auth.uid()) = id);

drop policy if exists "Users can view their own addresses" on public.addresses;
create policy "Users can view their own addresses"
  on public.addresses for select using ((select auth.uid()) = user_id);
drop policy if exists "Users can add their own addresses" on public.addresses;
create policy "Users can add their own addresses"
  on public.addresses for insert with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update their own addresses" on public.addresses;
create policy "Users can update their own addresses"
  on public.addresses for update using ((select auth.uid()) = user_id);
drop policy if exists "Users can delete their own addresses" on public.addresses;
create policy "Users can delete their own addresses"
  on public.addresses for delete using ((select auth.uid()) = user_id);
