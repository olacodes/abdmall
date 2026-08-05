import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { Category } from "@abdmall/core";

export function CategoryTile({ category }: { category: Category }) {
  return (
    <Link
      href={{ pathname: "/shop", params: { category: category.slug } }}
      asChild
    >
      <Pressable className="overflow-hidden rounded-xl border border-line bg-surface">
        <LinearGradient
          colors={[category.hue[0], category.hue[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 88 }}
        />
        <View className="flex-row items-center justify-between px-3 py-2.5">
          <Text numberOfLines={1} className="font-sans-bold text-sm text-ink">
            {category.name}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#7a5a16" />
        </View>
      </Pressable>
    </Link>
  );
}
