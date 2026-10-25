import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { fetchShopSettings } from "@abdmall/supabase";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();

  // Read through the caller's own client rather than the cached storefront
  // helper: the admin must see what is stored right now, not whatever the
  // storefront cache is still serving for the next hour.
  const settings = await fetchShopSettings(supabase);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl text-ink">Settings</h2>
        <p className="mt-0.5 text-sm text-muted">
          Bank account, contact details and delivery pricing · saving updates
          the storefront immediately
        </p>
      </div>

      <SettingsForm settings={settings} />

      <p className="text-xs text-faint">
        Every change here is recorded against your account with a timestamp.
      </p>
    </div>
  );
}
