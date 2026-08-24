-- ============================================================================
-- abdmall — 07. Team management
--
-- Backs the /admin/team page: list the admins, promote and demote by email.
--
-- The previous migration deliberately took `update (is_admin)` away from the
-- `authenticated` role, so an admin's own session cannot write that column and
-- a policy can't hand it back — RLS grants rows, not columns, and any policy
-- permissive enough for an admin would also cover the ordinary "update your own
-- profile" path. So the write goes through a security-definer function instead:
-- it runs as its owner, and checks `public.is_admin()` itself. Authorization
-- still lives in Postgres, page code still can't grant anyone anything, and
-- there is exactly one entry point to audit.
--
-- Re-runnable: columns use `if not exists`, functions are `create or replace`.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Who granted this, and when. Both null for an admin flagged by hand in the
-- SQL editor (as the first one was) — the page reads that as "not recorded"
-- rather than pretending to know.
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists admin_granted_by uuid
    references auth.users (id) on delete set null;

alter table public.profiles
  add column if not exists admin_granted_at timestamptz;

-- ---------------------------------------------------------------------------
-- The admin roster. Emails live in auth.users, which PostgREST does not expose,
-- so this is also the only way the page can show who an account belongs to.
--
-- A non-admin caller gets an empty set rather than an error: the page is
-- already gated, and an empty roster leaks nothing.
-- ---------------------------------------------------------------------------
create or replace function public.list_admins()
returns table (
  id               uuid,
  email            text,
  full_name        text,
  admin_granted_at timestamptz,
  granted_by_email text,
  created_at       timestamptz
)
language sql
stable
security definer set search_path = ''
as $$
  select p.id,
         u.email::text,
         p.full_name,
         p.admin_granted_at,
         g.email::text,
         p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  left join auth.users g on g.id = p.admin_granted_by
  where p.is_admin
    and public.is_admin()
  order by p.admin_granted_at asc nulls first, u.email asc;
$$;

-- ---------------------------------------------------------------------------
-- Promote or demote by email.
--
-- Two guards, both here rather than in the UI so they hold however the function
-- is called: you cannot remove your own access (the lockout people actually
-- hit), and the last admin cannot be removed at all.
-- ---------------------------------------------------------------------------
create or replace function public.set_admin(p_email text, p_make_admin boolean)
returns void
language plpgsql
volatile
security definer set search_path = ''
as $$
declare
  v_caller      uuid := (select auth.uid());
  v_target      uuid;
  v_admin_count int;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can change admin access.'
      using errcode = '42501';
  end if;

  select u.id into v_target
  from auth.users u
  where lower(u.email) = lower(trim(p_email));

  if v_target is null then
    raise exception 'No account with that email. Ask them to sign up first.'
      using errcode = 'P0002';
  end if;

  if not p_make_admin then
    if v_target = v_caller then
      raise exception 'You cannot remove your own admin access.'
        using errcode = 'P0001';
    end if;

    select count(*) into v_admin_count
    from public.profiles where is_admin;

    if v_admin_count <= 1 then
      raise exception 'There must always be at least one admin.'
        using errcode = 'P0001';
    end if;
  end if;

  update public.profiles
  set is_admin        = p_make_admin,
      admin_granted_by = case when p_make_admin then v_caller else null end,
      admin_granted_at = case when p_make_admin then now() else null end
  where id = v_target;

  if not found then
    raise exception 'That account has no profile row yet.'
      using errcode = 'P0002';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- `create function` grants EXECUTE to PUBLIC by default, which on a security
-- definer function means anonymous callers too. Both gate themselves on
-- is_admin(), but narrow the grant anyway.
-- ---------------------------------------------------------------------------
revoke execute on function public.list_admins() from public, anon;
revoke execute on function public.set_admin(text, boolean) from public, anon;

grant execute on function public.list_admins() to authenticated;
grant execute on function public.set_admin(text, boolean) to authenticated;
