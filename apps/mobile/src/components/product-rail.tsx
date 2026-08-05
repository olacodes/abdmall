import { View, Text, ScrollView, Pressable } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Product } from "@abdmall/core";
import { ProductCard } from "./product-card";

export function ProductRail({
  title,
  categorySlug,
  products,
}: {
  title: string;
  categorySlug: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <View className="rounded-xl border border-line bg-surface">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="font-display text-lg text-ink">{title}</Text>
        <Link href={{ pathname: "/shop", params: { category: categorySlug } }} asChild>
          <Pressable className="flex-row items-center gap-1">
            <Text className="font-sans-bold text-sm text-gold-deep">See all</Text>
            <Ionicons name="arrow-forward" size={14} color="#7a5a16" />
          </Pressable>
        </Link>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingBottom: 16 }}
      >
        {products.map((p) => (
          <View key={p.id} style={{ width: 160 }}>
            <ProductCard product={p} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
