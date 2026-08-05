import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { Product } from "@abdmall/core";

/**
 * Product image — the real photo from Supabase Storage when available, over a
 * swatch-gradient + monogram that shows while loading or as a fallback for
 * products without a photo.
 */
export function ProductArt({ product }: { product: Product }) {
  const monogram = product.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[product.swatch[0], product.swatch[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}
      >
        <Text className="font-display text-3xl text-white/85">{monogram}</Text>
      </LinearGradient>
      {product.image ? (
        <Image
          source={{ uri: product.image }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
        />
      ) : null}
    </View>
  );
}
