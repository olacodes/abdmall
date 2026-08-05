import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "@/lib/cart";

// Brand tokens (mirrors the web nav): gold active, muted inactive, hairline top.
const GOLD = "#b8860b";
const MUTED = "#635b4f";
const LINE = "#e8e2d6";

export default function TabsLayout() {
  const { count } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: MUTED,
        tabBarStyle: { backgroundColor: "#ffffff", borderTopColor: LINE },
        tabBarLabelStyle: { fontFamily: "HankenGrotesk-Medium", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: { backgroundColor: GOLD, color: "#14110b" },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
