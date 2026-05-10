import { Alert, View } from "react-native";
import { Image } from "expo-image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import {
  AppText,
  AuthPrompt,
  Button,
  Card,
  EmptyState,
  LoadingState,
  Screen,
  SectionHeading,
} from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import {
  useCartQuery,
  useRemoveCartItemMutation,
  useSessionUser,
  useUpdateCartItemMutation,
} from "@/query";
import { marketingImages } from "@/constants/media";
import { palette } from "@/theme";

export const CartScreen = () => {
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useSessionUser();
  const {
    data: cartItems = [],
    isLoading,
    error,
  } = useCartQuery(isAuthenticated);
  const updateCartItemMutation = useUpdateCartItemMutation();
  const removeCartItemMutation = useRemoveCartItemMutation();

  if (!isAuthenticated) {
    return (
      <Screen contentContainerClassName="pt-8" showAppHeader={false}>
        <AuthPrompt
          title="Your cart syncs with your account"
          description="Sign in to view the backend cart, update quantities, and continue to checkout."
        />
      </Screen>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const delivery = subtotal > 100 ? 0 : 15;
  const total = subtotal + delivery;

  const handleUpdateQuantity = async (cartId: string, quantity: number) => {
    if (quantity < 1) return;

    const response = await updateCartItemMutation.mutateAsync({
      cartId,
      quantity,
    });
    if (!response.success) {
      Alert.alert("Update failed", response.message);
    }
  };

  const handleRemove = async (cartId: number) => {
    const response = await removeCartItemMutation.mutateAsync(cartId);
    Alert.alert(
      response.success ? "Removed" : "Could not remove item",
      response.message,
    );
  };

  return (
    <Screen contentContainerClassName="pt-2 gap-5">
      <SectionHeading
        eyebrow="Cart"
        title="Your basket"
        description="The cart is backed by the same user API endpoints as the web app and cached locally with React Query."
      />

      {isLoading ? <LoadingState label="Loading cart..." /> : null}
      {error ? (
        <Card>
          <AppText className="text-destructive">{error.message}</AppText>
        </Card>
      ) : null}

      {!isLoading && cartItems.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add products from the shop to start a checkout."
          action={
            <Button
              onPress={() => navigation.navigate("Tabs", { screen: "Shop" })}
            >
              Start shopping
            </Button>
          }
        />
      ) : null}

      <View className="gap-4">
        {cartItems.map((item) => (
          <Card key={item.cart_id} className="gap-4">
            <View className="flex-row gap-4">
              <Image
                source={item.image || marketingImages.catfish}
                style={{ width: 84, height: 84, borderRadius: 18 }}
                contentFit="cover"
              />
              <View className="flex-1 gap-2">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <AppText weight="bold" className="text-lg">
                      {item.name}
                    </AppText>
                    <AppText className="text-sm text-brand-subtext">
                      {formatCurrency(item.price)} per unit
                    </AppText>
                  </View>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-0"
                    onPress={() => handleRemove(Number(item.cart_id))}
                  >
                    <Trash2 color={palette.danger} size={18} />
                  </Button>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() =>
                        handleUpdateQuantity(item.cart_id, item.quantity - 1)
                      }
                    >
                      <Minus color={palette.ink} size={16} />
                    </Button>
                    <AppText weight="bold">{item.quantity}</AppText>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() =>
                        handleUpdateQuantity(item.cart_id, item.quantity + 1)
                      }
                    >
                      <Plus color={palette.ink} size={16} />
                    </Button>
                  </View>
                  <AppText weight="bold" className="text-lg text-primary">
                    {formatCurrency(item.totalPrice)}
                  </AppText>
                </View>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {cartItems.length > 0 ? (
        <Card className="gap-4">
          <View className="flex-row items-center justify-between">
            <AppText className="text-brand-subtext">Subtotal</AppText>
            <AppText weight="semibold">{formatCurrency(subtotal)}</AppText>
          </View>
          <View className="flex-row items-center justify-between">
            <AppText className="text-brand-subtext">Delivery</AppText>
            <AppText weight="semibold">
              {delivery === 0 ? "Free" : formatCurrency(delivery)}
            </AppText>
          </View>
          <View className="flex-row items-center justify-between border-t border-brand-line pt-4">
            <AppText weight="bold" className="text-lg">
              Total
            </AppText>
            <AppText weight="bold" className="text-2xl text-primary">
              {formatCurrency(total)}
            </AppText>
          </View>
          <Button onPress={() => navigation.navigate("Checkout")}>
            Proceed to checkout
          </Button>
        </Card>
      ) : null}
    </Screen>
  );
};
