"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/auth";
import { deleteAccount } from "@/lib/delete-account";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRight, Check, Trash } from "@/components/icons";

/**
 * The interactive half of /account/delete.
 *
 * Only this part depends on who is signed in — the explanation of what is
 * deleted stays on the server so the page still says something useful without
 * JavaScript. That matters here more than on an ordinary page: this URL is
 * submitted to Google Play as the account deletion route, and a page that
 * renders as an empty skeleton to a plain fetch is a poor thing to hand a
 * reviewer.
 */

const CONFIRM_WORD = "DELETE";

export function DeleteAccountPanel() {
  const { user, loading } = useUser();
  const [confirmText, setConfirmText] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onDelete = async () => {
    setWorking(true);
    setError(null);
    const result = await deleteAccount();
    if (result.ok) {
      setDone(true);
    } else {
      setError(result.error);
      setWorking(false);
    }
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-xl border border-line bg-surface-2" />;
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-success/30 bg-success/5 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-white">
          <Check className="h-6 w-6" />
        </div>
        <div>
          <p className="font-display text-xl text-ink">Your account is closed</p>
          <p className="mt-1 text-sm text-muted">
            Your sign-in, profile and saved addresses have been deleted. Thank
            you for shopping with abdmall.
          </p>
        </div>
        <ButtonLink href="/" size="lg" className="self-start">
          Back to the shop <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted">
          Sign in with the account you want to close, then return to this page
          to confirm.
        </p>
        <ButtonLink href="/sign-in" size="lg" className="self-start">
          Sign in to continue <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-muted">
        You&rsquo;re signed in as{" "}
        <span className="font-semibold text-ink">{user.email}</span>. Closing
        this account removes it permanently.
      </p>

      <div className="rounded-xl border border-sale/40 bg-sale/5 p-5">
        <label className="block text-sm font-semibold text-ink">
          Type {CONFIRM_WORD} to confirm
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-label={`Type ${CONFIRM_WORD} to confirm`}
            className="mt-2 h-11 w-full rounded-lg border border-line bg-surface px-4 font-mono text-sm tracking-widest text-ink focus:border-sale focus:outline-none"
          />
        </label>

        <button
          type="button"
          onClick={onDelete}
          disabled={confirmText.trim().toUpperCase() !== CONFIRM_WORD || working}
          className="mt-4 inline-flex h-12 items-center gap-2 rounded-full bg-sale px-6 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash className="h-4 w-4" />
          {working ? "Deleting…" : "Delete my account"}
        </button>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-sale/30 bg-surface px-4 py-3 text-sm font-medium text-sale"
          >
            {error}
          </p>
        )}
      </div>

      <p className="text-sm text-muted">
        Changed your mind?{" "}
        <Link
          href="/account"
          className="font-semibold text-gold-deep underline-offset-4 hover:underline"
        >
          Back to your account
        </Link>
      </p>
    </div>
  );
}
