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

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const { error, needsConfirm } = await signUp(
      name.trim() || email.split("@")[0],
      email.trim(),
      password,
    );
    if (error) {
      setError(error);
      setBusy(false);
      return;
    }
    if (needsConfirm) {
      setConfirm(email.trim());
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
              Join abdmall
            </Text>
            <Text className="mt-1 font-display text-3xl text-ink">
              Create account
            </Text>
            <Text className="mt-1 font-sans text-sm text-muted">
              Track orders and check out in seconds.
            </Text>
          </View>

          {confirm ? (
            <View className="rounded-xl border border-line bg-surface p-5">
              <Text className="font-display text-lg text-ink">
                Check your email
              </Text>
              <Text className="mt-2 font-sans text-sm text-muted">
                We sent a confirmation link to{" "}
                <Text className="font-sans-bold text-ink">{confirm}</Text>.
                Confirm it, then sign in.
              </Text>
              <Link href="/sign-in" asChild>
                <Pressable className="mt-4 items-center justify-center rounded-full bg-gold py-3">
                  <Text className="font-sans-bold text-sm text-brand">
                    Go to sign in
                  </Text>
                </Pressable>
              </Link>
            </View>
          ) : (
            <>
              {error ? (
                <View className="rounded-lg border border-sale/30 bg-sale/10 px-4 py-3">
                  <Text className="font-sans-medium text-sm text-sale">
                    {error}
                  </Text>
                </View>
              ) : null}

              <Field
                label="Full name"
                value={name}
                onChangeText={setName}
                placeholder="Ada Obi"
                autoComplete="name"
              />
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
                placeholder="Create a password"
                secureTextEntry
                autoComplete="password-new"
              />

              <Pressable
                onPress={submit}
                disabled={busy}
                className="mt-2 items-center justify-center rounded-full bg-gold py-4"
                style={busy ? { opacity: 0.7 } : undefined}
              >
                <Text className="font-sans-bold text-sm text-brand">
                  {busy ? "Creating…" : "Create account"}
                </Text>
              </Pressable>

              <View className="flex-row justify-center gap-1">
                <Text className="font-sans text-sm text-muted">
                  Already have an account?
                </Text>
                <Link href="/sign-in" asChild>
                  <Pressable>
                    <Text className="font-sans-bold text-sm text-gold-deep">
                      Sign in
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
