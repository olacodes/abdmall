import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  compactCount,
  discountPercent,
  formatNaira,
  type Product,
} from "@abdmall/core";
import { useProducts, bySlug } from "@/lib/catalogue";
import { useCart } from "@/lib/cart";
import { ProductArt } from "@/components/product-art";

function TopBar({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-row items-center px-3 py-2">
      <Pressable
        onPress={onBack}
        hitSlop={12}
        className="h-10 w-10 items-center justify-center rounded-full"
      >
        <Ionicons name="arrow-back" size={24} color="#1b1712" />
      </Pressable>
    </View>
  );
}

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const productsQ = useProducts();
  const product: Product | undefined = productsQ.data
    ? bySlug(productsQ.data, slug)
    : undefined;

  if (productsQ.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-paper">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#b8860b" />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
        <TopBar onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center p-8">
          <Text className="font-display text-2xl text-ink">Not found</Text>
          <Text className="mt-2 text-center font-sans text-sm text-muted">
            This product is no longer available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const off = product.oldPrice
    ? discountPercent(product.oldPrice, product.price)
    : 0;
  const lowStock = product.stock !== undefined && product.stock <= 8;

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
      <TopBar onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Art */}
        <View className="mx-4 h-72 overflow-hidden rounded-2xl">
          <ProductArt product={product} />
        </View>

        <View className="gap-3 p-5">
          <Text className="font-sans-medium text-xs uppercase tracking-wide text-gold-deep">
            {product.category}
          </Text>
          <Text className="font-display text-2xl leading-tight text-ink">
            {product.name}
          </Text>

          <View className="flex-row flex-wrap items-center gap-x-2">
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={14} color="#f6a417" />
              <Text className="font-sans-bold text-sm text-ink">
                {product.rating.toFixed(1)}
              </Text>
            </View>
            <Text className="text-sm text-faint">·</Text>
            <Text className="text-sm text-muted">{product.reviews} reviews</Text>
            {product.sold ? (
              <>
                <Text className="text-sm text-faint">·</Text>
                <Text className="text-sm text-muted">
                  {compactCount(product.sold)} sold
                </Text>
              </>
            ) : null}
          </View>

          {/* Price */}
          <View className="mt-1 flex-row items-baseline gap-3">
            <Text className="font-sans-bold text-3xl text-ink">
              {formatNaira(product.price)}
            </Text>
            {product.oldPrice ? (
              <Text className="text-base text-faint line-through">
                {formatNaira(product.oldPrice)}
              </Text>
            ) : null}
            {off > 0 ? (
              <View className="rounded-md bg-sale px-2 py-0.5">
                <Text className="font-sans-bold text-xs text-white">−{off}%</Text>
              </View>
            ) : null}
          </View>
          {lowStock ? (
            <Text className="font-sans-bold text-sm text-sale">
              Selling fast — only {product.stock} left
            </Text>
          ) : null}

          <Text className="mt-1 font-sans text-base leading-relaxed text-muted">
            {product.blurb}
          </Text>

          {/* Add to cart */}
          <Pressable
            onPress={() => {
              addItem({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                swatch: product.swatch,
                image: product.image,
              });
              Alert.alert("Added to cart", product.name, [
                { text: "Keep shopping", style: "cancel" },
                { text: "View cart", onPress: () => router.push("/cart") },
              ]);
            }}
            className="mt-3 flex-row items-center justify-center gap-2 rounded-full bg-gold py-4"
          >
            <Ionicons name="cart-outline" size={18} color="#14110b" />
            <Text className="font-sans-bold text-sm text-brand">
              Add to cart
            </Text>
          </Pressable>

          {/* Delivery / trust */}
          <View className="mt-4 gap-3 rounded-2xl border border-line bg-surface p-4">
            <View className="flex-row items-center gap-3">
              <Ionicons name="car-outline" size={20} color="#b8860b" />
              <Text className="flex-1 font-sans text-sm text-muted">
                Delivery in 2–4 working days · flat ₦1,500, free over ₦100,000
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Ionicons name="shield-checkmark-outline" size={20} color="#b8860b" />
              <Text className="flex-1 font-sans text-sm text-muted">
                Secure, server-verified payment via Paystack
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
