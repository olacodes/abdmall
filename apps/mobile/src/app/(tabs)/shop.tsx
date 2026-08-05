import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ShopScreen() {
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
      <View className="flex-1 items-center justify-center p-8">
        <Text className="font-display text-2xl text-ink">Shop</Text>
        <Text className="mt-2 text-center font-sans text-sm text-muted">
          The catalogue lands here in M2 — wired to the same Supabase data as the
          web.
        </Text>
      </View>
    </SafeAreaView>
  );
}
