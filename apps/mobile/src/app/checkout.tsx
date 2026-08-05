import { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { formatNaira } from "@abdmall/core";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Field } from "@/components/field";
import {
  startCheckout,
  confirmCheckout,
  CHECKOUT_CALLBACK_URL,
} from "@/lib/checkout";

type Stage = "form" | "paying" | "confirming" | "success";
type Method = "card" | "transfer";

export default function Checkout() {
  const router = useRouter();
  const { items, subtotal, delivery, total, clear } = useCart();
  const { user } = useAuth();

  const [stage, setStage] = useState<Stage>("form");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [method, setMethod] = useState<Method>("card");
  const [form, setForm] = useState({
    email: user?.email ?? "",
    name: user?.name ?? "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  const reference = useRef<string | null>(null);
  const paid = useRef<{ reference: string; total: number } | null>(null);

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const pay = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await startCheckout({
      ...form,
      method,
      lines: items.map((i) => ({ slug: i.slug, size: i.size, qty: i.qty })),
    });
    setBusy(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    reference.current = res.reference;
    paid.current = { reference: res.reference, total: res.total };
    setAuthUrl(res.authorizationUrl);
    setStage("paying");
  };

  const handleReturn = async () => {
    setAuthUrl(null);
    setStage("confirming");
    const res = await confirmCheckout(reference.current!);
    if ("error" in res) {
      setError(res.error);
      setStage("form");
      return;
    }
    clear();
    setStage("success");
  };

  const onNav = (nav: WebViewNavigation) => {
    if (nav.url?.startsWith(CHECKOUT_CALLBACK_URL)) void handleReturn();
  };

  // --- Paystack WebView -------------------------------------------------------
  if (stage === "paying" && authUrl) {
    return (
      <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
        <View className="flex-row items-center justify-between border-b border-line px-3 py-2">
          <Pressable
            onPress={() => {
              setAuthUrl(null);
              setStage("form");
            }}
            hitSlop={12}
            className="h-10 flex-row items-center gap-1 px-2"
          >
            <Ionicons name="close" size={22} color="#1b1712" />
            <Text className="font-sans-medium text-sm text-ink">Cancel</Text>
          </Pressable>
          <Text className="font-sans-medium text-xs text-muted">
            Secure payment · Paystack
          </Text>
        </View>
        <WebView
          source={{ uri: authUrl }}
          onNavigationStateChange={onNav}
          onShouldStartLoadWithRequest={(r) => {
            if (r.url.startsWith(CHECKOUT_CALLBACK_URL)) {
              void handleReturn();
              return false;
            }
            return true;
          }}
          startInLoadingState
        />
      </SafeAreaView>
    );
  }

  // --- Confirming -------------------------------------------------------------
  if (stage === "confirming") {
    return (
      <SafeAreaView className="flex-1 bg-paper">
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#b8860b" />
          <Text className="font-sans text-sm text-muted">
            Verifying your payment…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- Success ----------------------------------------------------------------
  if (stage === "success") {
    return (
      <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
        <View className="flex-1 items-center justify-center gap-3 p-8">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-success">
            <Ionicons name="checkmark" size={40} color="#ffffff" />
          </View>
          <Text className="mt-2 font-display text-2xl text-ink">
            Order confirmed
          </Text>
          <Text className="text-center font-sans text-sm text-muted">
            Your payment was verified. A receipt is on its way to{" "}
            <Text className="font-sans-bold text-ink">{form.email}</Text>.
          </Text>
          <View className="mt-2 w-full items-center rounded-xl border border-line bg-surface p-5">
            <Text className="font-sans text-xs uppercase tracking-wide text-faint">
              Reference
            </Text>
            <Text className="mt-1 font-sans-bold text-lg text-gold-deep">
              {paid.current?.reference}
            </Text>
            <Text className="mt-2 font-sans-bold text-2xl text-ink">
              {formatNaira(paid.current?.total ?? 0)}
            </Text>
          </View>
          <Pressable
            onPress={() => router.replace("/shop")}
            className="mt-4 rounded-full bg-gold px-8 py-4"
          >
            <Text className="font-sans-bold text-sm text-brand">
              Continue shopping
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // --- Form -------------------------------------------------------------------
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
      <View className="flex-row items-center px-3 py-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color="#1b1712" />
        </Pressable>
        <Text className="font-display text-xl text-ink">Checkout</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {error ? (
            <View className="rounded-lg border border-sale/30 bg-sale/10 px-4 py-3">
              <Text className="font-sans-medium text-sm text-sale">{error}</Text>
            </View>
          ) : null}

          <Field
            label="Email"
            value={form.email}
            onChangeText={set("email")}
            placeholder="you@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Full name"
            value={form.name}
            onChangeText={set("name")}
            placeholder="Ada Obi"
          />
          <Field
            label="Phone"
            value={form.phone}
            onChangeText={set("phone")}
            placeholder="080 0000 0000"
            keyboardType="phone-pad"
          />
          <Field
            label="Address"
            value={form.address}
            onChangeText={set("address")}
            placeholder="12 Marina Road"
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field
                label="City"
                value={form.city}
                onChangeText={set("city")}
                placeholder="Lagos"
              />
            </View>
            <View className="flex-1">
              <Field
                label="State"
                value={form.state}
                onChangeText={set("state")}
                placeholder="Lagos"
              />
            </View>
          </View>

          {/* Payment method */}
          <View className="gap-2">
            <Text className="font-sans-medium text-xs uppercase tracking-wide text-muted">
              Payment
            </Text>
            <View className="flex-row gap-3">
              {(
                [
                  { key: "card", label: "Card", icon: "card-outline" },
                  { key: "transfer", label: "Bank transfer", icon: "swap-horizontal-outline" },
                ] as const
              ).map((m) => (
                <Pressable
                  key={m.key}
                  onPress={() => setMethod(m.key)}
                  className={`flex-1 flex-row items-center gap-2 rounded-xl border p-4 ${
                    method === m.key
                      ? "border-gold bg-gold-soft"
                      : "border-line bg-surface"
                  }`}
                >
                  <Ionicons name={m.icon} size={20} color="#7a5a16" />
                  <Text className="font-sans-medium text-sm text-ink">
                    {m.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Summary */}
          <View className="gap-2.5 rounded-xl border border-line bg-surface p-5">
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

          <Pressable
            onPress={pay}
            disabled={busy}
            className="flex-row items-center justify-center gap-2 rounded-full bg-gold py-4"
            style={busy ? { opacity: 0.7 } : undefined}
          >
            {busy ? (
              <ActivityIndicator color="#14110b" />
            ) : (
              <>
                <Ionicons name="lock-closed" size={16} color="#14110b" />
                <Text className="font-sans-bold text-sm text-brand">
                  Pay {formatNaira(total)}
                </Text>
              </>
            )}
          </Pressable>
          <Text className="pb-6 text-center font-sans text-xs text-faint">
            Payment is verified server-side before your order is confirmed.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
