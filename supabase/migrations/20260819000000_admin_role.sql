-- ============================================================================
-- abdmall — 05. Admin role
-- Adds an admin flag to profiles and the write policies the admin UI needs.
--
-- Authorization is enforced by Postgres, not by the app: the admin pages use
-- the caller's own session, so a missed check in a Server Action cannot grant
-- writes. The service-role client stays reserved for the checkout functions.
--
-- Re-runnable: column uses `if not exists`, function is `create or replace`,
-- policies are dropped-then-created.
-- ============================================================================

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- ---------------------------------------------------------------------------
-- Who is an admin?
--
-- security definer so the lookup isn't itself filtered by the profiles RLS
-- policy (which only exposes your own row) — the same pattern handle_new_user
-- uses. Empty search_path means every reference must be schema-qualified.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = (select auth.uid())),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- Catalogue writes
--
-- Public read policies from migration 01 stay as they are; these add admin
-- write access on top. Admins also need to READ inactive products, which the
-- public "Active products are readable by everyone" policy hides.
-- ---------------------------------------------------------------------------
drop policy if exists "Admins can read every product" on public.products;
create policy "Admins can read every product"
  on public.products for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories"
  on public.categories for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories"
  on public.categories for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories"
  on public.categories for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Orders — admins see every order, including guest ones, and can move them
-- through fulfilment. No insert/delete: orders are created by the checkout
-- Edge Functions and deleting one would orphan its history.
-- ---------------------------------------------------------------------------
drop policy if exists "Admins can read every order" on public.orders;
create policy "Admins can read every order"
  on public.orders for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can read every order item" on public.order_items;
create policy "Admins can read every order item"
  on public.order_items for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Product imagery — the bucket is public to read; only admins may write to it.
-- ---------------------------------------------------------------------------
drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can replace product images" on storage.objects;
create policy "Admins can replace product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
