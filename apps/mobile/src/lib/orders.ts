import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";

export type MyOrder = {
  reference: string;
  created_at: string;
  status: string;
  total: number;
  itemCount: number;
};

type OrderRow = {
  reference: string;
  created_at: string;
  status: string;
  total: number;
  order_items: { quantity: number }[] | null;
};

/**
 * The signed-in user's orders. RLS scopes this to their own rows, so no
 * user filter is needed. Enabled only when authed.
 */
export function useMyOrders(enabled: boolean) {
  return useQuery({
    queryKey: ["my-orders"],
    enabled,
    queryFn: async (): Promise<MyOrder[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("reference, created_at, status, total, order_items(quantity)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data as OrderRow[] | null) ?? []).map((o) => ({
        reference: o.reference,
        created_at: o.created_at,
        status: o.status,
        total: o.total,
        itemCount: (o.order_items ?? []).reduce((n, i) => n + i.quantity, 0),
      }));
    },
  });
}
