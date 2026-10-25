"use client";

import { useActionState, useState } from "react";
import type { ShopSettings } from "@abdmall/core";
import { saveSettings, type SettingsState } from "@/app/admin/settings/actions";

const EMPTY: SettingsState = {};

function Field({
  name,
  label,
  defaultValue,
  hint,
  error,
  type = "text",
  onChange,
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  hint?: string;
  error?: string;
  type?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={`mt-1.5 w-full rounded-lg border bg-paper px-3 py-2 text-sm text-ink placeholder:text-faint focus:outline-none ${
          error ? "border-sale focus:border-sale" : "border-line focus:border-gold"
        }`}
      />
      {error ? (
        <span className="mt-1 block text-xs text-sale">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-faint">{hint}</span>
      ) : null}
    </label>
  );
}

/**
 * The owner's settings form.
 *
 * The account number is the one field here that routes money, and a wrong
 * digit fails silently in both directions — customers pay a stranger and
 * nothing in the system notices. So it alone is re-typed to save, and the
 * confirm box only appears once the number has actually been edited: asking
 * for it when someone came to change the delivery fee would just train people
 * to copy-paste past it.
 */
export function SettingsForm({ settings }: { settings: ShopSettings }) {
  const [state, formAction, pending] = useActionState(saveSettings, EMPTY);
  const [accountNumber, setAccountNumber] = useState(
    settings.bankAccountNumber,
  );

  const numberChanged = accountNumber !== settings.bankAccountNumber;
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-8">
      <section className="rounded-xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Bank account
        </h2>
        <p className="mt-1 text-xs text-muted">
          Shown to customers who choose &ldquo;Pay to our account&rdquo; at
          checkout. Nothing watches this account — transfers into it are
          confirmed by hand from <code>/admin/orders</code>.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field
            name="bank_account_name"
            label="Account name"
            defaultValue={settings.bankAccountName}
            error={errors.bank_account_name}
          />
          <Field
            name="bank_name"
            label="Bank"
            defaultValue={settings.bankName}
            error={errors.bank_name}
          />
          <Field
            name="bank_account_number"
            label="Account number"
            defaultValue={settings.bankAccountNumber}
            onChange={setAccountNumber}
            hint="10 digits."
            error={errors.bank_account_number}
          />
          {numberChanged ? (
            <Field
              name="bank_account_number_confirm"
              label="Re-type account number"
              hint="Changing this sends customers' money somewhere new."
              error={errors.bank_account_number_confirm}
            />
          ) : (
            // Keeps the field present so the server always receives it, and
            // matching, when the number was not touched.
            <input
              type="hidden"
              name="bank_account_number_confirm"
              value={settings.bankAccountNumber}
            />
          )}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Contact</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field
            name="whatsapp_number"
            label="WhatsApp number"
            defaultValue={settings.whatsappNumber}
            hint="International form, digits only — e.g. 2349037335409."
            error={errors.whatsapp_number}
          />
          <Field
            name="support_phone"
            label="Support phone"
            defaultValue={settings.supportPhone}
            hint="Optional."
            error={errors.support_phone}
          />
          <Field
            name="support_email"
            label="Support email"
            type="email"
            defaultValue={settings.supportEmail}
            hint="Optional."
            error={errors.support_email}
          />
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Delivery
        </h2>
        <p className="mt-1 text-xs text-muted">
          Applied to every new order. The checkout function recomputes the fee
          server-side, so changing it here changes what customers are actually
          charged — not just what they are shown.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field
            name="delivery_fee"
            label="Delivery fee (₦)"
            defaultValue={settings.deliveryFee}
            error={errors.delivery_fee}
          />
          <Field
            name="free_delivery_threshold"
            label="Free delivery from (₦)"
            defaultValue={settings.freeDeliveryThreshold}
            hint="Orders at or above this subtotal pay no delivery."
            error={errors.free_delivery_threshold}
          />
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-brand transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
        {state.error ? (
          <span className="text-sm text-sale">{state.error}</span>
        ) : state.savedAt ? (
          <span className="text-sm text-success">
            Saved — live on the site now.
          </span>
        ) : null}
      </div>
    </form>
  );
}
