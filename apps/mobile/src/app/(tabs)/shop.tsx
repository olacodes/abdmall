import { useMemo, useState } from "react";
import { View, Text, TextInput, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProducts } from "@/lib/catalogue";
import { ProductCard } from "@/components/product-card";

export default function ShopScreen() {
  const params = useLocalSearchParams<{ category?: string; q?: string }>();
  const productsQ = useProducts();
  const [query, setQuery] = useState(params.q ?? "");

  const items = useMemo(() => {
    let list = productsQ.data ?? [];
    if (params.category) list = list.filter((p) => p.category === params.category);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.blurb.toLowerCase().includes(q),
      );
    }
    return list;
  }, [productsQ.data, params.category, query]);

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
      <View className="gap-2 px-4 pb-3 pt-2">
        <Text className="font-display text-2xl capitalize text-ink">
          {params.category ?? "All products"}
        </Text>
        <View className="flex-row items-center gap-2 rounded-full border border-line bg-surface px-4">
          <Ionicons name="search" size={18} color="#726a5a" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search products…"
            placeholderTextColor="#726a5a"
            className="h-11 flex-1 font-sans text-sm text-ink"
          />
        </View>
      </View>

      {productsQ.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#b8860b" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View className="flex-1">
              <ProductCard product={item} />
            </View>
          )}
          ListEmptyComponent={
            <Text className="mt-10 text-center font-sans text-sm text-muted">
              No products found.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
