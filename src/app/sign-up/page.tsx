"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell, AuthField } from "@/components/auth/auth-shell";
import { signUp } from "@/lib/auth";
import { ArrowRight } from "@/components/icons";

export default function SignUpPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const name = String(form.get("name") ?? "") || email.split("@")[0];
    const password = String(form.get("password") ?? "");
    setBusy(true);
    setError(null);
    const { error, needsConfirm } = await signUp(name, email, password);
    if (error) {
      setError(error);
      setBusy(false);
      return;
    }
    if (needsConfirm) {
      setConfirm(email);
      setBusy(false);
      return;
    }
    router.push("/account");
    router.refresh();
  };

  return (
    <AuthShell
      eyebrow="Join abdmall"
      title="Create account"
      subtitle="Track orders, save your details and check out in seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-gold-deep hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {confirm ? (
        <div
          role="status"
          className="rounded-xl border border-line bg-surface-2 px-5 py-6 text-center"
        >
          <p className="font-display text-lg font-semibold text-ink">
            Check your email
          </p>
          <p className="mt-2 text-sm text-muted">
            We sent a confirmation link to{" "}
            <span className="font-semibold text-ink">{confirm}</span>. Confirm it
            to finish creating your account, then sign in.
          </p>
          <Link
            href="/sign-in"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full gold-fill px-6 text-sm font-semibold"
          >
            Go to sign in <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-sale/30 bg-sale/10 px-4 py-3 text-sm font-medium text-sale"
          >
            {error}
          </p>
        )}
        <AuthField
          label="Full name"
          name="name"
          placeholder="Ada Obi"
          autoComplete="name"
        />
        <AuthField
          label="Email"
          name="email"
          type="email"
          placeholder="you@email.com"
          autoComplete="email"
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={busy}
          className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-full gold-fill px-8 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-70"
        >
          {busy ? "Creating…" : "Create account"}
          {!busy && <ArrowRight className="h-4 w-4" />}
        </button>

        <p className="mt-1 text-center text-xs text-faint">
          By continuing you agree to our Terms &amp; Privacy Policy.
        </p>
      </form>
      )}
    </AuthShell>
  );
}
