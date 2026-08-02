"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell, AuthField } from "@/components/auth/auth-shell";
import { setUser } from "@/lib/auth";
import { ArrowRight } from "@/components/icons";

export default function SignInPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    setBusy(true);
    setUser({ email, name: email.split("@")[0] || "Shopper" });
    setTimeout(() => router.push("/account"), 400);
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Access your orders, saved details and faster checkout."
      footer={
        <>
          New to abdmall?{" "}
          <Link href="/sign-up" className="font-semibold text-gold-deep hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <AuthField
          label="Email"
          name="email"
          type="email"
          placeholder="you@email.com"
          autoComplete="email"
        />
        <label className="flex flex-col gap-1.5">
          <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted">
            Password
            <Link
              href="/sign-in"
              className="normal-case tracking-normal text-faint hover:text-gold-deep"
            >
              Forgot?
            </Link>
          </span>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            autoComplete="current-password"
            className="h-12 rounded-lg border border-line bg-surface-2 px-4 text-sm text-ink placeholder:text-faint focus:border-line-strong focus:bg-surface focus:outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-full gold-fill px-8 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-70"
        >
          {busy ? "Signing in…" : "Sign in"}
          {!busy && <ArrowRight className="h-4 w-4" />}
        </button>

        <Link
          href="/shop"
          className="mt-1 text-center text-sm text-muted transition-colors hover:text-gold-deep"
        >
          Continue as guest
        </Link>
      </form>
    </AuthShell>
  );
}
