"use client";

import { useActionState } from "react";
import { acceptInvite, type AcceptState } from "@/app/invite/[token]/actions";

const EMPTY: AcceptState = {};

export function InviteAccept({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(acceptInvite, EMPTY);

  return (
    <div className="w-full space-y-3">
      <form action={formAction}>
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-full gold-fill px-8 text-sm font-bold transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-70"
        >
          {pending ? "Accepting…" : "Accept and open the admin"}
        </button>
      </form>
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-sale/30 bg-sale/10 px-4 py-3 text-sm font-medium text-sale"
        >
          {state.error}
        </p>
      )}
    </div>
  );
}
