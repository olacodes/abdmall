import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  compactCount,
  discountPercent,
  formatNaira,
  FREE_DELIVERY_THRESHOLD,
  type Product,
} from "@abdmall/core";
import { ProductArt } from "./product-art";

export function ProductCard({ product }: { product: Product }) {
  const off = product.oldPrice
    ? discountPercent(product.oldPrice, product.price)
    : 0;
  const freeDelivery = product.price >= FREE_DELIVERY_THRESHOLD;
  const lowStock = product.stock !== undefined && product.stock <= 8;

  return (
    <Link
      href={{ pathname: "/product/[slug]", params: { slug: product.slug } }}
      asChild
    >
      <Pressable className="flex-1 overflow-hidden rounded-xl border border-line bg-surface">
        <View className="relative aspect-square">
          <ProductArt product={product} />
          {off > 0 ? (
            <View className="absolute left-2 top-2 rounded-md bg-sale px-1.5 py-0.5">
              <Text className="font-sans-bold text-xs text-white">−{off}%</Text>
            </View>
          ) : product.badge === "bestseller" ? (
            <View className="absolute left-2 top-2 rounded-md bg-brand px-1.5 py-0.5">
              <Text className="font-sans-bold text-[10px] uppercase text-white">
                Bestseller
              </Text>
            </View>
          ) : product.badge === "new" ? (
            <View className="absolute left-2 top-2 rounded-md bg-gold-soft px-1.5 py-0.5">
              <Text className="font-sans-bold text-[10px] uppercase text-gold-deep">
                New
              </Text>
            </View>
          ) : null}
        </View>

        <View className="gap-1 p-3">
          <Text
            numberOfLines={2}
            className="min-h-[36px] font-sans-medium text-sm leading-snug text-ink"
          >
            {product.name}
          </Text>

          <View className="flex-row flex-wrap items-center gap-x-1.5">
            <View className="flex-row items-center gap-0.5">
              <Ionicons name="star" size={12} color="#f6a417" />
              <Text className="font-sans-bold text-xs text-ink">
                {product.rating.toFixed(1)}
              </Text>
            </View>
            <Text className="text-xs text-faint">·</Text>
            <Text className="text-xs text-muted">{product.reviews} reviews</Text>
            {product.sold ? (
              <>
                <Text className="text-xs text-faint">·</Text>
                <Text className="text-xs text-muted">
                  {compactCount(product.sold)} sold
                </Text>
              </>
            ) : null}
          </View>

          <View className="flex-row items-baseline gap-2">
            <Text className="font-sans-bold text-lg text-ink">
              {formatNaira(product.price)}
            </Text>
            {product.oldPrice ? (
              <Text className="text-xs text-faint line-through">
                {formatNaira(product.oldPrice)}
              </Text>
            ) : null}
          </View>

          <View className="min-h-[16px] flex-row items-center gap-2">
            {freeDelivery ? (
              <Text className="font-sans-bold text-[11px] text-success">
                Free delivery
              </Text>
            ) : null}
            {lowStock ? (
              <Text className="font-sans-bold text-[11px] text-sale">
                Only {product.stock} left
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
