import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { Field } from "@/components/field";

export default function SignIn() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const { error } = await signIn(email.trim(), password);
    if (error) {
      setError(error);
      setBusy(false);
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-paper">
      <View className="flex-row justify-end px-3 py-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="close" size={26} color="#1b1712" />
        </Pressable>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Text className="font-sans-medium text-xs uppercase tracking-wide text-gold-deep">
              Welcome back
            </Text>
            <Text className="mt-1 font-display text-3xl text-ink">Sign in</Text>
            <Text className="mt-1 font-sans text-sm text-muted">
              Access your orders and faster checkout.
            </Text>
          </View>

          {error ? (
            <View className="rounded-lg border border-sale/30 bg-sale/10 px-4 py-3">
              <Text className="font-sans-medium text-sm text-sale">{error}</Text>
            </View>
          ) : null}

          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="password"
          />

          <Pressable
            onPress={submit}
            disabled={busy}
            className="mt-2 items-center justify-center rounded-full bg-gold py-4"
            style={busy ? { opacity: 0.7 } : undefined}
          >
            <Text className="font-sans-bold text-sm text-brand">
              {busy ? "Signing in…" : "Sign in"}
            </Text>
          </Pressable>

          <View className="flex-row justify-center gap-1">
            <Text className="font-sans text-sm text-muted">
              New to abdmall?
            </Text>
            <Link href="/sign-up" asChild>
              <Pressable>
                <Text className="font-sans-bold text-sm text-gold-deep">
                  Create an account
                </Text>
              </Pressable>
            </Link>
          </View>

          <Pressable onPress={() => router.back()}>
            <Text className="text-center font-sans text-sm text-muted">
              Continue as guest
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
