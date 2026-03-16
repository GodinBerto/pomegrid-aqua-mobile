import React from "react";
import { Alert, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { MessageCircle, Minus, Package, Plus, Ruler, Star } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getProductImageSource } from "@/constants/media";
import { AppText, Badge, Button, Card, LoadingState, Screen } from "@/components/ui";
import { useAddToCartMutation, useProduct } from "@/hooks/useAppData";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { palette } from "@/theme";

export const ProductDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: product, isLoading, error } = useProduct(route.params?.productId);
  const addToCartMutation = useAddToCartMutation();
  const [quantity, setQuantity] = React.useState(1);

  const handleAddToCart = async () => {
    if (!product?.id) return;

    if (!isAuthenticated) {
      navigation.navigate("Login");
      return;
    }

    const response = await addToCartMutation.mutateAsync({
      product_id: Number(product.id),
      quantity,
    });

    Alert.alert(response.success ? "Added to cart" : "Could not add to cart", response.message);
  };

  if (isLoading) {
    return (
      <Screen contentContainerClassName="pt-8">
        <LoadingState label="Loading product details..." />
      </Screen>
    );
  }

  if (error || !product) {
    return (
      <Screen contentContainerClassName="pt-8">
        <Card>
          <AppText className="text-destructive">{error?.message || "Product not found."}</AppText>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen contentContainerClassName="pt-2 gap-6">
      <Card className="p-0 overflow-hidden">
        <Image source={getProductImageSource(product)} style={{ width: "100%", height: 260 }} contentFit="cover" />
      </Card>

      <View className="gap-4">
        <View className="flex-row flex-wrap gap-2">
          <Badge label={product.category} />
          <Badge label={product.animal_stage === 0 ? "Young" : "Mature"} />
          {product.discount_percentage ? <Badge label={`${product.discount_percentage}% off`} tone="danger" /> : null}
        </View>

        <View className="gap-2">
          <AppText weight="bold" className="text-3xl leading-9">
            {product.title}
          </AppText>
          <View className="flex-row items-center gap-2">
            <Star size={16} color={palette.warning} fill={palette.warning} />
            <AppText weight="semibold" className="text-sm">
              {(product.rating || 4.5).toFixed(1)}
            </AppText>
            <AppText className="text-sm text-brand-subtext">Freshly listed for the mobile storefront</AppText>
          </View>
        </View>

        <AppText weight="bold" className="text-3xl text-primary">
          {formatCurrency(product.price)}
        </AppText>
        <AppText className="text-base leading-7 text-brand-subtext">{product.description}</AppText>

        <View className="flex-row flex-wrap gap-3">
          <Card className="min-w-[150px] flex-1 gap-2">
            <View className="flex-row items-center gap-2">
              <Package color={palette.primary} size={18} />
              <AppText weight="semibold">Stock</AppText>
            </View>
            <AppText className="text-sm text-brand-subtext">{product.quantity} available</AppText>
          </Card>
          <Card className="min-w-[150px] flex-1 gap-2">
            <View className="flex-row items-center gap-2">
              <Ruler color={palette.primary} size={18} />
              <AppText weight="semibold">Unit</AppText>
            </View>
            <AppText className="text-sm text-brand-subtext">{product.weight_per_unit}</AppText>
          </Card>
        </View>

        <Card className="gap-4">
          <AppText weight="bold" className="text-lg">
            Quantity
          </AppText>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => setQuantity((current) => Math.max(1, current - 1))}
                className="h-11 w-11 items-center justify-center rounded-full border border-brand-line bg-white"
              >
                <Minus color={palette.ink} size={18} />
              </Pressable>
              <AppText weight="bold" className="text-2xl">
                {quantity}
              </AppText>
              <Pressable
                onPress={() => setQuantity((current) => Math.min(product.quantity, current + 1))}
                className="h-11 w-11 items-center justify-center rounded-full border border-brand-line bg-white"
              >
                <Plus color={palette.ink} size={18} />
              </Pressable>
            </View>
            <Button onPress={handleAddToCart}>Add to cart</Button>
          </View>
        </Card>

        <Card className="gap-3 bg-secondary">
          <AppText weight="bold" className="text-lg text-primary">
            Need advice before ordering?
          </AppText>
          <AppText className="text-sm leading-6 text-primary">
            Your support chat is built in on mobile, so users can ask about stock, delivery, and farm fit without leaving the app.
          </AppText>
          <Button variant="outline" className="self-start" onPress={() => navigation.navigate("Chat")}>
            <View className="flex-row items-center gap-2">
              <MessageCircle color={palette.primary} size={18} />
              <AppText weight="semibold" className="text-primary">
                Chat with support
              </AppText>
            </View>
          </Button>
        </Card>
      </View>
    </Screen>
  );
};
