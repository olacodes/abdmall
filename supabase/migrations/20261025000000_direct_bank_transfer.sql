-- ---------------------------------------------------------------------------
-- Direct bank transfer — payment made into the shop's own account, outside
-- Paystack.
--
-- Every other payment route ends at confirm_order() in the Edge Functions,
-- which marks an order `paid` only after Paystack verifies the transaction.
-- A direct transfer has no such proof: a human reads the bank statement and
-- says so. That makes this the one path where `paid` rests on judgement, so
-- it is deliberately narrow — see confirm_direct_transfer below.
--
-- No new order_status value. An order awaiting a transfer is genuinely
-- `pending`; what distinguishes it from an abandoned Paystack checkout is
-- payment_method, which is the column that owns that distinction. Keeping the
-- enum untouched also avoids `alter type ... add value`, which cannot be used
-- in the same transaction that adds it.
-- ---------------------------------------------------------------------------

-- Until now this was free text carrying 'card' and 'transfer'. A typo here
-- would strand an order: confirm_direct_transfer refuses anything that is not
-- exactly 'direct', and nothing else can move it to paid.
alter table public.orders
  drop constraint if exists orders_payment_method_check;

alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method is null or payment_method in ('card', 'transfer', 'direct'));

-- Who vouched for the money, and what they matched it against. Both are set
-- together by confirm_direct_transfer and stay null for Paystack orders, so a
-- non-null paid_confirmed_by is exactly the set of hand-confirmed payments.
alter table public.orders
  add column if not exists paid_confirmed_by uuid references auth.users (id) on delete set null;

alter table public.orders
  add column if not exists paid_reference text;

comment on column public.orders.paid_confirmed_by is
  'Admin who confirmed a direct bank transfer by hand. Null for Paystack-verified orders.';
comment on column public.orders.paid_reference is
  'Bank narration or teller reference the admin matched the transfer against.';

-- ---------------------------------------------------------------------------
-- The only supported way to mark a direct transfer paid.
--
-- The rules live here rather than in the admin page so they hold however this
-- is called. In particular it refuses to touch a Paystack order: those are
-- owned by the checkout functions, and confirming one by hand would assert
-- money arrived with nothing behind the claim.
-- ---------------------------------------------------------------------------
create or replace function public.confirm_direct_transfer(
  p_order_id       uuid,
  p_bank_reference text
)
returns void
language plpgsql
volatile
security definer set search_path = ''
as $$
declare
  v_caller uuid := (select auth.uid());
  v_order  public.orders%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can confirm a transfer.'
      using errcode = '42501';
  end if;

  if coalesce(trim(p_bank_reference), '') = '' then
    raise exception 'Record the bank reference you matched this against.'
      using errcode = 'P0001';
  end if;

  select * into v_order from public.orders where id = p_order_id;

  if v_order.id is null then
    raise exception 'Order not found.' using errcode = 'P0002';
  end if;

  if v_order.payment_method is distinct from 'direct' then
    raise exception 'That order is paid through Paystack. Only its own verification can mark it paid.'
      using errcode = 'P0001';
  end if;

  if v_order.status = 'paid' then
    raise exception 'That order is already marked paid.' using errcode = 'P0001';
  end if;

  if v_order.status <> 'pending' then
    raise exception 'Only a pending order can be confirmed.' using errcode = 'P0001';
  end if;

  update public.orders
  set status            = 'paid',
      paid_at           = now(),
      paid_confirmed_by = v_caller,
      paid_reference    = trim(p_bank_reference)
  where id = p_order_id;
end;
$$;

-- `create function` grants EXECUTE to PUBLIC by default; this is admin-only.
revoke execute on function public.confirm_direct_transfer(uuid, text) from public, anon;
