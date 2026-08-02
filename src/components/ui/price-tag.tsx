import { discountPercent, formatNaira } from "@/lib/format";

export function PriceTag({
  price,
  oldPrice,
  size = "md",
  className = "",
}: {
  price: number;
  oldPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const priceClass =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl";
  const off = oldPrice ? discountPercent(oldPrice, price) : 0;

  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`}>
      <span className={`${priceClass} font-extrabold tracking-tight text-ink`}>
        {formatNaira(price)}
      </span>
      {oldPrice && (
        <>
          <span className="text-sm text-faint line-through">
            {formatNaira(oldPrice)}
          </span>
          {off > 0 && (
            <span className="text-xs font-bold text-sale">−{off}%</span>
          )}
        </>
      )}
    </div>
  );
}
