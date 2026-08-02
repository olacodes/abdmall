"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell, AuthField } from "@/components/auth/auth-shell";
import { setUser } from "@/lib/auth";
import { ArrowRight } from "@/components/icons";

export default function SignUpPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const name = String(form.get("name") ?? "") || email.split("@")[0];
    setBusy(true);
    setUser({ email, name });
    setTimeout(() => router.push("/account"), 400);
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
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
    </AuthShell>
  );
}
