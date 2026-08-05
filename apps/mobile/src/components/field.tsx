import { View, Text, TextInput, type TextInputProps } from "react-native";

export function Field({
  label,
  ...props
}: { label: string } & TextInputProps) {
  return (
    <View className="gap-1.5">
      <Text className="font-sans-medium text-xs uppercase tracking-wide text-muted">
        {label}
      </Text>
      <TextInput
        placeholderTextColor="#726a5a"
        className="h-12 rounded-lg border border-line bg-surface px-4 font-sans text-sm text-ink"
        {...props}
      />
    </View>
  );
}
