import type { ReactNode } from "react";

type Tone =
  | "gold"
  | "sale"
  | "deal"
  | "new"
  | "bestseller"
  | "hot"
  | "muted"
  | "success";

const tones: Record<Tone, string> = {
  gold: "gold-fill",
  sale: "bg-sale text-white",
  deal: "bg-sale text-white",
  new: "bg-gold-soft text-gold-deep border border-[color:var(--gold)]/30",
  bestseller: "bg-brand text-white",
  hot: "bg-sale/10 text-sale border border-sale/30",
  muted: "bg-surface-2 text-muted border border-line",
  success: "bg-[color:var(--success)]/12 text-success border border-[color:var(--success)]/30",
};

const labels: Partial<Record<Tone, string>> = {
  deal: "Deal",
  new: "New",
  bestseller: "Bestseller",
};

export function Badge({
  tone = "gold",
  children,
  className = "",
}: {
  tone?: Tone;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide ${tones[tone]} ${className}`}
    >
      {children ?? labels[tone]}
    </span>
  );
}
