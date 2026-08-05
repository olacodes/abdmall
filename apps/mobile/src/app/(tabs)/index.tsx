import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useCategories, useProducts, byCategory } from "@/lib/catalogue";
import { CategoryTile } from "@/components/category-tile";
import { ProductRail } from "@/components/product-rail";

const RAILS = [
  { title: "Fashion & Native Wear", slug: "fashion" },
  { title: "Phones, Power & Gadgets", slug: "electronics" },
  { title: "Home & Kitchen", slug: "home" },
  { title: "Beauty & Personal Care", slug: "beauty" },
  { title: "Jewelry & Gemstones", slug: "jewelry" },
  { title: "Groceries & Foodstuff", slug: "groceries" },
];

export default function HomeScreen() {
  const productsQ = useProducts();
  const categoriesQ = useCategories();

  const onRefresh = () => {
    productsQ.refetch();
    categoriesQ.refetch();
  };

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={productsQ.isRefetching || categoriesQ.isRefetching}
            onRefresh={onRefresh}
            tintColor="#b8860b"
          />
        }
      >
        {/* Hero */}
        <View className="rounded-2xl bg-brand p-6">
          <Text className="font-display text-3xl text-white">abdmall</Text>
          <Text className="mt-1 font-sans text-base text-white/70">
            Shop everything you love, delivered.
          </Text>
          <Link href="/shop" asChild>
            <Pressable className="mt-5 self-start rounded-full bg-gold px-6 py-3">
              <Text className="font-sans-bold text-sm text-brand">Shop now</Text>
            </Pressable>
          </Link>
        </View>

        {(productsQ.isLoading || categoriesQ.isLoading) && (
          <View className="items-center py-10">
            <ActivityIndicator color="#b8860b" />
          </View>
        )}

        {productsQ.isError && (
          <View className="rounded-xl border border-line bg-surface p-5">
            <Text className="font-sans text-sm text-sale">
              Couldn&rsquo;t load the catalogue. Check your connection and try
              again.
            </Text>
          </View>
        )}

        {/* Categories */}
        {categoriesQ.data ? (
          <View className="gap-3">
            <Text className="font-display text-xl text-ink">
              Shop by category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {categoriesQ.data.map((c) => (
                <View key={c.slug} style={{ width: 140 }}>
                  <CategoryTile category={c} />
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Per-category product rails */}
        {productsQ.data
          ? RAILS.map((r) => (
              <ProductRail
                key={r.slug}
                title={r.title}
                categorySlug={r.slug}
                products={byCategory(productsQ.data, r.slug)}
              />
            ))
          : null}
      </ScrollView>
    </SafeAreaView>
  );
}
