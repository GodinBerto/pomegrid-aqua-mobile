import React, { useEffect } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { PackageSearch } from "lucide-react-native";
import { productCategories } from "@/constants/categories";
import { ProductCard } from "@/components/ProductCard";
import {
  AuthPrompt,
  Chip,
  LoadingState,
  Screen,
  SectionHeading,
  TextField,
} from "@/components/ui";
import { useAddToCartMutation, useProducts, useSessionUser } from "@/query";
import { normalizeCategoryName } from "@/lib/utils";

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

export const ProductsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isAuthenticated } = useSessionUser();
  const { data: products = [], isLoading, error } = useProducts();
  const addToCartMutation = useAddToCartMutation();
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortOption, setSortOption] = React.useState<SortOption>("featured");

  useEffect(() => {
    const routeCategory = route.params?.category;
    if (routeCategory) {
      setActiveCategory(normalizeCategoryName(routeCategory) || "all");
    }
  }, [route.params?.category]);

  const filteredProducts = [...products]
    .filter((product) => {
      const matchesCategory =
        activeCategory === "all" ||
        normalizeCategoryName(product.category).toLowerCase() ===
          activeCategory.toLowerCase();
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        product.title.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    })
    .sort((left, right) => {
      switch (sortOption) {
        case "price-asc":
          return left.price - right.price;
        case "price-desc":
          return right.price - left.price;
        case "name-asc":
          return left.title.localeCompare(right.title);
        case "featured":
        default:
          return (right.isFeatured ? 1 : 0) - (left.isFeatured ? 1 : 0);
      }
    });

  const handleAddToCart = async (productId: string | number) => {
    if (!isAuthenticated) {
      navigation.navigate("Login");
      return;
    }

    const response = await addToCartMutation.mutateAsync({
      product_id: Number(productId),
      quantity: 1,
    });

    Alert.alert(
      response.success ? "Added to cart" : "Could not add to cart",
      response.message,
    );
  };

  return (
    <Screen contentContainerClassName="pt-2 gap-5">
      <SectionHeading
        eyebrow="Shop"
        title="Browse products"
        description="Filter by category, search the catalog, and add products straight into the cached cart flow."
      />

      <TextField
        label="Search"
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search products, stock, or equipment"
      />

      <View className="gap-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-5 px-5"
        >
          {productCategories.map((category) => (
            <Chip
              key={category}
              label={category === "all" ? "All" : category}
              active={activeCategory.toLowerCase() === category.toLowerCase()}
              onPress={() => setActiveCategory(category)}
            />
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-5 px-5"
        >
          <Chip
            label="Featured"
            active={sortOption === "featured"}
            onPress={() => setSortOption("featured")}
          />
          <Chip
            label="Price: Low"
            active={sortOption === "price-asc"}
            onPress={() => setSortOption("price-asc")}
          />
          <Chip
            label="Price: High"
            active={sortOption === "price-desc"}
            onPress={() => setSortOption("price-desc")}
          />
          <Chip
            label="A - Z"
            active={sortOption === "name-asc"}
            onPress={() => setSortOption("name-asc")}
          />
        </ScrollView>
      </View>

      {isLoading ? <LoadingState label="Loading products..." /> : null}
      {error ? (
        <AuthPrompt
          title="Could not load products"
          description={error.message}
        />
      ) : null}

      {!isLoading && !error && filteredProducts.length === 0 ? (
        <AuthPrompt
          title="No products match your filters"
          description="Try a different category or search term to widen the result set."
        />
      ) : null}

      {!isLoading && !error ? (
        <View className="gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={String(product.id)}
              product={product}
              onPress={() =>
                navigation.navigate("ProductDetails", {
                  productId: String(product.id),
                  title: product.title,
                })
              }
              onAddToCart={() => handleAddToCart(product.id || 0)}
            />
          ))}
        </View>
      ) : null}
    </Screen>
  );
};
