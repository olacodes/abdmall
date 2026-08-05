import Link from "next/link";
import type { ReactNode } from "react";
import { CartGlyph } from "@/components/icons";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-14 sm:py-20">
      <Link href="/" className="mx-auto flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg gold-fill">
          <CartGlyph className="h-5 w-5" />
        </span>
        <span className="font-display text-2xl font-semibold text-ink">
          abdmall
        </span>
      </Link>

      <div className="mt-8 rounded-2xl border border-line bg-surface p-7 shadow-sm sm:p-9">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </div>

      <div className="mt-6 text-center text-sm text-muted">{footer}</div>
    </div>
  );
}

export function AuthField({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-12 rounded-lg border border-line bg-surface-2 px-4 text-sm text-ink placeholder:text-faint focus:border-line-strong focus:bg-surface focus:outline-none"
      />
    </label>
  );
}
