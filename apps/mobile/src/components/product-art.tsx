import { Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { Product } from "@abdmall/core";

/**
 * Product image placeholder — the swatch gradient + monogram, matching the
 * web's fallback art. Real seller photos arrive when imagery moves to Supabase
 * Storage (a later task); until then every card uses this.
 */
export function ProductArt({ product }: { product: Product }) {
  const monogram = product.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <LinearGradient
      colors={[product.swatch[0], product.swatch[1]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <Text className="font-display text-3xl text-white/85">{monogram}</Text>
    </LinearGradient>
  );
}
