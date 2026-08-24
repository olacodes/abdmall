-- ============================================================================
-- abdmall — 06. Lock down who can write profiles.is_admin
--
-- Closes a privilege escalation: `is_admin` decides who gets the whole admin
-- surface (products, categories, every order, the image bucket), but any
-- signed-in shopper could set it on themselves.
--
-- Two things combined to allow it. Supabase's default grants give the
-- `authenticated` role UPDATE on every column of tables in `public`, and the
-- profiles update policy from migration 02 only constrains WHICH ROW you may
-- write (`auth.uid() = id`) — never which COLUMNS. So `update profiles set
-- is_admin = true where id = <me>` passed both checks. Verified against the
-- live database on 24 Aug 2026 with a throwaway user: the write succeeded and
-- persisted.
--
-- RLS cannot express "any column but this one", so the fix is column-level
-- grants: take away the blanket UPDATE and hand back only the columns a
-- customer legitimately edits. Postgres will not let you carve a single column
-- out of a table-wide grant, hence revoke-then-grant rather than
-- `revoke update (is_admin)`.
--
-- NOTE FOR LATER: a new user-editable column on profiles must be added to the
-- grant below, or writes to it will fail with "permission denied for table
-- profiles". That is the intended trade — new columns are locked by default.
--
-- Re-runnable: revoke/grant are idempotent, the policy is dropped-then-created.
-- ============================================================================

revoke update on public.profiles from authenticated, anon;

grant update (full_name, phone) on public.profiles to authenticated;

-- Row ownership was already enforced (an omitted WITH CHECK falls back to
-- USING), but state it explicitly so the intent survives future edits.
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- `is_admin` is now writable only by roles that bypass these grants: the
-- service-role key and the dashboard's SQL editor. Granting a new admin stays
-- a deliberate act by someone with database access.
