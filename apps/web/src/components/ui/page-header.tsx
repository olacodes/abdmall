import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  crumb,
}: {
  title: string;
  subtitle?: string;
  crumb?: string;
}) {
  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
        <nav className="mb-1 flex items-center gap-2 text-xs text-faint">
          <Link href="/" className="hover:text-gold-deep">
            Home
          </Link>
          <span>›</span>
          <span className="text-muted">{crumb ?? title}</span>
        </nav>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
