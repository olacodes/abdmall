-- ============================================================================
-- abdmall — 08. Admin invites
--
-- Lets you grant admin access to someone who doesn't have an account yet. The
-- Team page could only promote existing accounts, so onboarding meant "sign up
-- first, tell me when you're done, then I'll promote you".
--
-- No email is sent. The invite produces a link the admin passes on however they
-- like — WhatsApp today, a real email once a sending domain is configured. That
-- is deliberate: delivery is not part of the security model, so adding email
-- later changes nothing here.
--
-- Two gates guard acceptance, and both matter:
--   * the token, so a mistyped invite can't be claimed by whoever happens to
--     own that address;
--   * the signed-in email matching the invite, so a forwarded link is useless
--     to anyone else.
-- Plus single use and a 14-day expiry.
--
-- Re-runnable: table/index use `if not exists`, functions are `create or
-- replace`, policies dropped-then-created.
-- ============================================================================

create table if not exists public.admin_invites (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  token       text not null unique,
  invited_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '14 days',
  accepted_at timestamptz,
  accepted_by uuid references auth.users (id) on delete set null,
  revoked_at  timestamptz,
  revoked_by  uuid references auth.users (id) on delete set null
);

create index if not exists admin_invites_email_idx
  on public.admin_invites (lower(email));

-- RLS on with no policies at all: every read and write goes through the
-- security-definer functions below, so `authenticated` can never touch the
-- table directly — not even to read a token belonging to someone else.
alter table public.admin_invites enable row level security;

-- ---------------------------------------------------------------------------
-- Invite or promote, whichever applies.
--
-- One entry point so the UI needs one box: if the email already has an account
-- it's promoted on the spot (reusing set_admin, guards and all), otherwise a
-- fresh invite is minted. Any earlier pending invite for that address is
-- revoked first, which also makes this the "regenerate the link" path.
-- ---------------------------------------------------------------------------
create or replace function public.invite_admin(p_email text)
returns table (outcome text, token text)
language plpgsql
volatile
security definer set search_path = ''
as $$
declare
  v_caller uuid := (select auth.uid());
  v_email  text := lower(trim(p_email));
  v_user   uuid;
  v_token  text;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can invite an admin.' using errcode = '42501';
  end if;

  if v_email = '' or position('@' in v_email) = 0 then
    raise exception 'That does not look like an email address.' using errcode = 'P0001';
  end if;

  select u.id into v_user from auth.users u where lower(u.email) = v_email;

  if v_user is not null then
    if (select p.is_admin from public.profiles p where p.id = v_user) then
      raise exception 'They are already an admin.' using errcode = 'P0001';
    end if;

    -- Existing account: nothing to accept, just grant it.
    perform public.set_admin(v_email, true);
    return query select 'promoted'::text, null::text;
  end if;

  update public.admin_invites
  set revoked_at = now(), revoked_by = v_caller
  where lower(email) = v_email
    and accepted_at is null
    and revoked_at is null;

  v_token := replace(gen_random_uuid()::text, '-', '')
          || replace(gen_random_uuid()::text, '-', '');

  insert into public.admin_invites (email, token, invited_by)
  values (v_email, v_token, v_caller);

  return query select 'invited'::text, v_token;
end;
$$;

-- ---------------------------------------------------------------------------
-- Claim an invite. Called by the invitee's own session, so this is the one
-- function here that does NOT require the caller to be an admin — the token
-- and the email match are what authorize it.
-- ---------------------------------------------------------------------------
create or replace function public.accept_admin_invite(p_token text)
returns void
language plpgsql
volatile
security definer set search_path = ''
as $$
declare
  v_caller       uuid := (select auth.uid());
  v_caller_email text;
  v_invite       public.admin_invites;
begin
  if v_caller is null then
    raise exception 'Sign in first to accept this invite.' using errcode = '42501';
  end if;

  select lower(u.email) into v_caller_email from auth.users u where u.id = v_caller;

  select * into v_invite
  from public.admin_invites
  where token = p_token;

  if v_invite.id is null then
    raise exception 'This invite link is not valid.' using errcode = 'P0002';
  end if;
  if v_invite.revoked_at is not null then
    raise exception 'This invite has been revoked.' using errcode = 'P0001';
  end if;
  if v_invite.accepted_at is not null then
    raise exception 'This invite has already been used.' using errcode = 'P0001';
  end if;
  if v_invite.expires_at < now() then
    raise exception 'This invite has expired. Ask for a new link.' using errcode = 'P0001';
  end if;
  if lower(v_invite.email) is distinct from v_caller_email then
    raise exception 'This invite was sent to a different email address.'
      using errcode = '42501';
  end if;

  update public.profiles
  set is_admin         = true,
      admin_granted_by = v_invite.invited_by,
      admin_granted_at = now()
  where id = v_caller;

  update public.admin_invites
  set accepted_at = now(), accepted_by = v_caller
  where id = v_invite.id;
end;
$$;

-- ---------------------------------------------------------------------------
-- What the invitee should be told before they sign in. Deliberately narrow:
-- the email the invite is for, and whether it's still usable. Callable by
-- anyone, because the token is the credential — but knowing a token reveals
-- only the address it was sent to.
-- ---------------------------------------------------------------------------
create or replace function public.admin_invite_status(p_token text)
returns table (email text, state text)
language sql
stable
security definer set search_path = ''
as $$
  select i.email,
         case
           when i.revoked_at is not null  then 'revoked'
           when i.accepted_at is not null then 'accepted'
           when i.expires_at < now()      then 'expired'
           else 'pending'
         end
  from public.admin_invites i
  where i.token = p_token;
$$;

-- ---------------------------------------------------------------------------
-- The roster of outstanding invites, for the Team page.
-- ---------------------------------------------------------------------------
create or replace function public.list_admin_invites()
returns table (
  id               uuid,
  email            text,
  token            text,
  invited_by_email text,
  created_at       timestamptz,
  expires_at       timestamptz,
  expired          boolean
)
language sql
stable
security definer set search_path = ''
as $$
  select i.id,
         i.email,
         i.token,
         u.email::text,
         i.created_at,
         i.expires_at,
         i.expires_at < now()
  from public.admin_invites i
  left join auth.users u on u.id = i.invited_by
  where i.accepted_at is null
    and i.revoked_at is null
    and public.is_admin()
  order by i.created_at desc;
$$;

create or replace function public.revoke_admin_invite(p_id uuid)
returns void
language plpgsql
volatile
security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can revoke an invite.' using errcode = '42501';
  end if;

  update public.admin_invites
  set revoked_at = now(), revoked_by = (select auth.uid())
  where id = p_id and accepted_at is null and revoked_at is null;

  if not found then
    raise exception 'That invite is no longer outstanding.' using errcode = 'P0002';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- `create function` grants EXECUTE to PUBLIC by default. Only the status
-- lookup is meant to be reachable before signing in.
-- ---------------------------------------------------------------------------
revoke execute on function public.invite_admin(text) from public, anon;
revoke execute on function public.accept_admin_invite(text) from public, anon;
revoke execute on function public.list_admin_invites() from public, anon;
revoke execute on function public.revoke_admin_invite(uuid) from public, anon;

grant execute on function public.invite_admin(text) to authenticated;
grant execute on function public.accept_admin_invite(text) to authenticated;
grant execute on function public.list_admin_invites() to authenticated;
grant execute on function public.revoke_admin_invite(uuid) to authenticated;
grant execute on function public.admin_invite_status(text) to anon, authenticated;
