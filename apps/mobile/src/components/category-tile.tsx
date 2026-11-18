import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { Image } from "expo-image";
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
        <View style={{ height: 88 }}>
          {/* The gradient is the floor, not the finish: it shows through while
              the photo loads and stands in for a category that has none. */}
          <LinearGradient
            colors={[category.hue[0], category.hue[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", inset: 0 }}
          />
          {category.image ? (
            <Image
              source={{ uri: category.image }}
              contentFit="cover"
              transition={200}
              style={{ position: "absolute", inset: 0 }}
              accessibilityIgnoresInvertColors
            />
          ) : null}
        </View>
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
