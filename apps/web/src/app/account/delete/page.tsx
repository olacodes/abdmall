"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/auth";
import { deleteAccount } from "@/lib/delete-account";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRight, Check, Trash } from "@/components/icons";

/**
 * Closing an account, from the web.
 *
 * This page is deliberately reachable while signed out. Both app stores
 * require a deletion route someone can follow after they've uninstalled the
 * app, and a page that only works for a signed-in visitor fails that test —
 * so the signed-out state explains the process and offers a way through
 * rather than bouncing to sign-in.
 */

const CONFIRM_WORD = "DELETE";

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-16 sm:px-8">
      <p className="eyebrow">Your account</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{title}</h1>
      <div className="mt-6 flex flex-col gap-5">{children}</div>
    </div>
  );
}

/** What goes and what stays — the same promise the privacy policy makes. */
function WhatHappens() {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 text-sm">
      <p className="font-semibold text-ink">What gets deleted</p>
      <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-muted">
        <li>Your sign-in and password</li>
        <li>Your profile — name and phone number</li>
        <li>Any saved delivery addresses</li>
      </ul>
      <p className="mt-4 font-semibold text-ink">What we have to keep</p>
      <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-muted">
        <li>
          Past orders stay on file, because we&rsquo;re required to keep a record
          of sales. They are no longer linked to an account, and you won&rsquo;t
          be able to see them here any more.
        </li>
      </ul>
      <p className="mt-4 text-faint">
        This cannot be undone. Shopping as a guest still works, and you can
        create a new account at any time.
      </p>
    </div>
  );
}

export default function DeleteAccountPage() {
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
    return (
      <div className="mx-auto max-w-xl px-5 py-16 sm:px-8">
        <div className="h-64 animate-pulse rounded-xl border border-line bg-surface-2" />
      </div>
    );
  }

  if (done) {
    return (
      <Shell title="Your account is closed">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success text-white">
          <Check className="h-7 w-7" />
        </div>
        <p className="text-muted">
          Your sign-in, profile and saved addresses have been deleted. Thank you
          for shopping with abdmall.
        </p>
        <ButtonLink href="/" size="lg" className="self-start">
          Back to the shop <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell title="Delete your abdmall account">
        <p className="text-muted">
          Sign in with the account you want to close, then come back to this
          page to confirm.
        </p>
        <WhatHappens />
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/sign-in" size="lg">
            Sign in to continue <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
        <p className="text-sm text-muted">
          Can&rsquo;t sign in? Email{" "}
          <a
            href="mailto:support@abdmall.com?subject=Delete%20my%20account"
            className="font-semibold text-gold-deep underline-offset-4 hover:underline"
          >
            support@abdmall.com
          </a>{" "}
          from the address on the account and we&rsquo;ll close it for you.
        </p>
      </Shell>
    );
  }

  return (
    <Shell title="Delete your abdmall account">
      <p className="text-muted">
        You&rsquo;re signed in as{" "}
        <span className="font-semibold text-ink">{user.email}</span>. Closing
        this account removes it permanently.
      </p>

      <WhatHappens />

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
    </Shell>
  );
}
