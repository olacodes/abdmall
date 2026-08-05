import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatNaira } from "@abdmall/core";

// M1 skeleton: proves the ported design system (tokens + fonts + NativeWind)
// and the shared @abdmall/core package render. Real catalogue data lands in M2.
export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
      <ScrollView className="flex-1">
        <View className="gap-5 p-5">
          {/* Brand hero band */}
          <View className="rounded-2xl bg-brand p-6">
            <Text className="font-display text-3xl text-white">abdmall</Text>
            <Text className="mt-1 font-sans text-base text-white/70">
              Modern commerce, simplified.
            </Text>
            <Pressable className="mt-5 self-start rounded-full bg-gold px-6 py-3">
              <Text className="font-sans-bold text-sm text-brand">
                Shop now
              </Text>
            </Pressable>
          </View>

          {/* Design-system proof card */}
          <View className="rounded-2xl border border-line bg-surface p-5">
            <Text className="font-sans-bold text-lg text-ink">
              Design system wired
            </Text>
            <Text className="mt-1 font-sans text-sm text-muted">
              Theme tokens, Fraunces + Hanken fonts, and the shared
              @abdmall/core package are live.
            </Text>

            <View className="mt-4 flex-row items-center gap-3">
              <Text className="font-sans-bold text-2xl text-ink">
                {formatNaira(135000)}
              </Text>
              <Text className="font-sans text-base text-faint line-through">
                {formatNaira(185000)}
              </Text>
              <View className="rounded-md bg-sale px-2 py-1">
                <Text className="font-sans-bold text-xs text-white">−27%</Text>
              </View>
            </View>

            <View className="mt-4 flex-row items-center gap-2">
              <View className="rounded-full bg-gold-soft px-3 py-1">
                <Text className="font-sans-medium text-xs text-gold-deep">
                  Free delivery over ₦100,000
                </Text>
              </View>
              <View className="rounded-full bg-success/15 px-3 py-1">
                <Text className="font-sans-medium text-xs text-success">
                  In stock
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
