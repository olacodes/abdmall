import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { formatNaira } from "@abdmall/core";
import { useAuth } from "@/lib/auth";
import { useMyOrders, type MyOrder } from "@/lib/orders";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  paid: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function OrderCard({ order }: { order: MyOrder }) {
  return (
    <View className="rounded-xl border border-line bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-sans-bold text-sm text-gold-deep">
          {order.reference}
        </Text>
        <View className="rounded-full bg-gold-soft px-2.5 py-1">
          <Text className="font-sans-medium text-xs text-gold-deep">
            {STATUS_LABEL[order.status] ?? order.status}
          </Text>
        </View>
      </View>
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="font-sans text-xs text-muted">
          {order.itemCount} item{order.itemCount === 1 ? "" : "s"} ·{" "}
          {new Date(order.created_at).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Text>
        <Text className="font-sans-bold text-base text-ink">
          {formatNaira(order.total)}
        </Text>
      </View>
    </View>
  );
}

export default function AccountScreen() {
  const { user, loading, signOut } = useAuth();
  const ordersQ = useMyOrders(Boolean(user));

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#b8860b" />
        </View>
      </SafeAreaView>
    );
  }

  // Signed-out gate
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
        <View className="flex-1 items-center justify-center gap-3 p-8">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-gold-soft">
            <Ionicons name="person-outline" size={28} color="#7a5a16" />
          </View>
          <Text className="mt-2 font-display text-2xl text-ink">
            Your account
          </Text>
          <Text className="text-center font-sans text-sm text-muted">
            Sign in to view your orders and saved details — or keep shopping as a
            guest.
          </Text>
          <View className="mt-4 w-full gap-3">
            <Link href="/sign-in" asChild>
              <Pressable className="items-center justify-center rounded-full bg-gold py-4">
                <Text className="font-sans-bold text-sm text-brand">
                  Sign in
                </Text>
              </Pressable>
            </Link>
            <Link href="/sign-up" asChild>
              <Pressable className="items-center justify-center rounded-full border border-line bg-surface py-4">
                <Text className="font-sans-bold text-sm text-ink">
                  Create an account
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Signed-in
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-gold">
              <Text className="font-display text-xl text-brand">
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-display text-xl text-ink">{user.name}</Text>
              <Text className="font-sans text-sm text-faint">{user.email}</Text>
            </View>
          </View>
          <Pressable
            onPress={() => signOut()}
            className="rounded-full border border-line bg-surface px-4 py-2"
          >
            <Text className="font-sans-medium text-xs text-ink">Sign out</Text>
          </Pressable>
        </View>

        <View className="gap-3">
          <Text className="font-display text-xl text-ink">Your orders</Text>

          {ordersQ.isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#b8860b" />
            </View>
          ) : ordersQ.data && ordersQ.data.length > 0 ? (
            ordersQ.data.map((o) => <OrderCard key={o.reference} order={o} />)
          ) : (
            <View className="items-center rounded-xl border border-dashed border-line bg-surface p-8">
              <Text className="font-sans-bold text-ink">No orders yet</Text>
              <Text className="mt-1 text-center font-sans text-sm text-muted">
                When you place an order, it&rsquo;ll show up here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
