import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CartScreen() {
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
      <View className="flex-1 items-center justify-center p-8">
        <Text className="font-display text-2xl text-ink">Cart</Text>
        <Text className="mt-2 text-center font-sans text-sm text-muted">
          Cart and checkout (Paystack via Edge Functions) arrive in M4.
        </Text>
      </View>
    </SafeAreaView>
  );
}
