-- ---------------------------------------------------------------------------
-- Make the bank reference optional when confirming a direct transfer.
--
-- The previous version refused a blank reference so that every hand-confirmed
-- payment carried something to audit against. In practice a transfer is often
-- matched from a statement line with no reference worth retyping, and the
-- check only ever bound this path anyway: admins hold UPDATE on every column
-- of orders, so anyone determined to skip it already could.
--
-- paid_confirmed_by is still always set, so a hand-confirmed payment remains
-- distinguishable from a Paystack-verified one — which is the part that
-- actually matters. paid_reference now records the reference when there is
-- one, and null when there isn't, rather than blocking the confirmation.
-- ---------------------------------------------------------------------------
create or replace function public.confirm_direct_transfer(
  p_order_id       uuid,
  p_bank_reference text default null
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
      -- Blank and whitespace-only both land as null, so "no reference" is one
      -- value rather than three.
      paid_reference    = nullif(trim(coalesce(p_bank_reference, '')), '')
  where id = p_order_id;
end;
$$;

revoke execute on function public.confirm_direct_transfer(uuid, text) from public, anon;
