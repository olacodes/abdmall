import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
      <View className="flex-1 items-center justify-center p-8">
        <Text className="font-display text-2xl text-ink">Account</Text>
        <Text className="mt-2 text-center font-sans text-sm text-muted">
          Supabase Auth (email/password) and order history come in M3.
        </Text>
      </View>
    </SafeAreaView>
  );
}
