import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { formatNaira, type CartItem } from "@abdmall/core";
import { useCart } from "@/lib/cart";

function QtyButton({
  icon,
  onPress,
}: {
  icon: "remove" | "add";
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      className="h-8 w-8 items-center justify-center rounded-full border border-line bg-surface"
    >
      <Ionicons name={icon} size={16} color="#1b1712" />
    </Pressable>
  );
}

function Row({
  item,
  onQty,
  onRemove,
}: {
  item: CartItem;
  onQty: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <View className="flex-row gap-3 rounded-xl border border-line bg-surface p-3">
      <LinearGradient
        colors={[item.swatch[0], item.swatch[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: 64, height: 64, borderRadius: 8 }}
      />
      <View className="flex-1 justify-between">
        <View className="flex-row items-start justify-between gap-2">
          <Text numberOfLines={2} className="flex-1 font-sans-medium text-sm text-ink">
            {item.name}
            {item.size ? (
              <Text className="text-muted"> · {item.size}</Text>
            ) : null}
          </Text>
          <Pressable onPress={onRemove} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color="#726a5a" />
          </Pressable>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <QtyButton icon="remove" onPress={() => onQty(item.qty - 1)} />
            <Text className="font-sans-bold text-sm text-ink">{item.qty}</Text>
            <QtyButton icon="add" onPress={() => onQty(item.qty + 1)} />
          </View>
          <Text className="font-sans-bold text-base text-ink">
            {formatNaira(item.price * item.qty)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const { items, subtotal, delivery, total, setQty, removeItem, hydrated } =
    useCart();

  if (hydrated && items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
        <View className="flex-1 items-center justify-center gap-3 p-8">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-gold-soft">
            <Ionicons name="cart-outline" size={28} color="#7a5a16" />
          </View>
          <Text className="mt-2 font-display text-2xl text-ink">
            Your cart is empty
          </Text>
          <Text className="text-center font-sans text-sm text-muted">
            Add a few things and they&rsquo;ll show up here.
          </Text>
          <Link href="/shop" asChild>
            <Pressable className="mt-4 rounded-full bg-gold px-6 py-3">
              <Text className="font-sans-bold text-sm text-brand">
                Browse products
              </Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
      <View className="px-5 pb-2 pt-2">
        <Text className="font-display text-2xl text-ink">Cart</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        {items.map((item) => (
          <Row
            key={item.key}
            item={item}
            onQty={(q) => setQty(item.key, q)}
            onRemove={() => removeItem(item.key)}
          />
        ))}

        {/* Summary */}
        <View className="mt-2 gap-2.5 rounded-xl border border-line bg-surface p-5">
          <View className="flex-row justify-between">
            <Text className="font-sans text-sm text-muted">Subtotal</Text>
            <Text className="font-sans-bold text-sm text-ink">
              {formatNaira(subtotal)}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-sans text-sm text-muted">Delivery</Text>
            <Text className="font-sans-bold text-sm text-ink">
              {delivery === 0 ? (
                <Text className="text-success">Free</Text>
              ) : (
                formatNaira(delivery)
              )}
            </Text>
          </View>
          <View className="mt-1 flex-row justify-between border-t border-line pt-3">
            <Text className="font-sans-bold text-base text-ink">Total</Text>
            <Text className="font-sans-bold text-xl text-ink">
              {formatNaira(total)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout bar */}
      <View className="border-t border-line bg-surface px-5 pb-8 pt-3">
        <Pressable
          onPress={() => router.push("/checkout")}
          className="flex-row items-center justify-center gap-2 rounded-full bg-gold py-4"
        >
          <Ionicons name="lock-closed" size={16} color="#14110b" />
          <Text className="font-sans-bold text-sm text-brand">
            Checkout · {formatNaira(total)}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
