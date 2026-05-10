import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { CreditCard, Landmark, Truck } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { CheckoutStepper } from "@/components/CheckoutStepper";
import {
  AppText,
  AuthPrompt,
  Button,
  Card,
  EmptyState,
  Screen,
  TextField,
} from "@/components/ui";
import { createOrder, initializePayment, removeCartItem, verifyPayment } from "@/api";
import { useCartQuery, useSessionUser } from "@/query";
import { formatCurrency } from "@/lib/utils";
import { defaultCheckoutForm, useCheckoutStore } from "@/store/checkoutStore";
import type { MobileProvider } from "@/types/domain";
import { formatPaymentMethodLabel, isPhysicalPaymentMethod, isSuccessfulGatewayPayment } from "@/lib/payment";
import { palette } from "@/theme";

type Step = "cart" | "details" | "payment";

const buildShippingAddress = (form: typeof defaultCheckoutForm) => {
  if (form.shippingMethod === "pickup") return undefined;
  return [form.address, form.city, form.region, form.postalCode]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ");
};

const buildOrderNotes = (form: typeof defaultCheckoutForm, mobileProvider: MobileProvider) =>
  [
    `Customer: ${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
    `Email: ${form.email.trim()}`,
    `Phone: ${form.phone.trim()}`,
    `Shipping method: ${form.shippingMethod || "not selected"}`,
    `Payment method: ${formatPaymentMethodLabel(form.paymentMethod)}`,
    ...(mobileProvider ? [`Mobile provider: ${mobileProvider.toUpperCase()}`] : []),
  ].join("\n");

export const CheckoutScreen = () => {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSessionUser();
  const { data: cartItems = [], isLoading } = useCartQuery(isAuthenticated);
  const { form, pendingOnlinePayment, resetCheckout, setPendingOnlinePayment, updateForm } =
    useCheckoutStore();
  const [step, setStep] = React.useState<Step>("cart");
  const [couponCode, setCouponCode] = React.useState("");
  const [cardName, setCardName] = React.useState("");
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardExpiry, setCardExpiry] = React.useState("");
  const [cardCvv, setCardCvv] = React.useState("");
  const [mobileProvider, setMobileProvider] = React.useState<MobileProvider>("");
  const [mobileNumber, setMobileNumber] = React.useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = React.useState(false);
  const [statusCard, setStatusCard] = React.useState<{
    tone: "default" | "success" | "danger";
    title: string;
    message: string;
  } | null>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const delivery = subtotal > 100 ? 0 : 15;
  const total = subtotal + delivery;
  const callbackUrl = Linking.createURL("checkout-return");

  const clearCheckoutState = () => {
    resetCheckout();
    setCouponCode("");
    setCardName("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setMobileProvider("");
    setMobileNumber("");
    setStep("cart");
  };

  const cleanUpCartItems = async (cartItemIds: number[]) => {
    const cleanupResults = await Promise.allSettled(cartItemIds.map((cartId) => removeCartItem(cartId)));
    const hasIssues = cleanupResults.some(
      (result) => result.status === "rejected" || !result.value.success,
    );

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["cart"] }),
      queryClient.invalidateQueries({ queryKey: ["orders"] }),
    ]);

    return hasIssues;
  };

  const validateDetails = () => {
    if (!form.firstName || !form.lastName) {
      Alert.alert("Missing details", "Please provide your first and last name.");
      return false;
    }

    if (!form.email || !form.phone) {
      Alert.alert("Missing details", "Please provide your email and phone number.");
      return false;
    }

    if (!form.shippingMethod) {
      Alert.alert("Missing details", "Select a shipping method.");
      return false;
    }

    if (form.shippingMethod !== "pickup" && (!form.address || !form.city || !form.region || !form.postalCode)) {
      Alert.alert("Address required", "Complete your shipping address or choose pickup.");
      return false;
    }

    if (!form.paymentMethod) {
      Alert.alert("Missing details", "Select a payment method.");
      return false;
    }

    return true;
  };

  const validatePayment = () => {
    if (!form.paymentMethod) {
      Alert.alert("Missing details", "Select a payment method first.");
      return false;
    }

    if (form.paymentMethod === "card") {
      if (!cardName || cardNumber.replace(/\D/g, "").length < 12 || !cardExpiry || cardCvv.length < 3) {
        Alert.alert("Incomplete card details", "Enter the card holder name and valid card details.");
        return false;
      }
    }

    if (form.paymentMethod === "mobile" && (!mobileProvider || !mobileNumber)) {
      Alert.alert("Mobile money required", "Select a provider and enter the phone number.");
      return false;
    }

    return true;
  };

  const verifyAndFinalizePayment = async (reference: string, cartItemIds: number[]) => {
    setStatusCard({
      tone: "default",
      title: "Verifying payment",
      message: "We are confirming your Paystack transaction now.",
    });

    const verification = await verifyPayment(reference);
    if (!verification.success || !verification.data) {
      setStatusCard({
        tone: "danger",
        title: "Verification failed",
        message: verification.message,
      });
      Alert.alert("Payment verification failed", verification.message);
      return;
    }

    if (!isSuccessfulGatewayPayment(verification.data.status)) {
      setStatusCard({
        tone: "danger",
        title: "Payment incomplete",
        message: verification.data.gateway_response || `Status: ${verification.data.status}`,
      });
      Alert.alert("Payment incomplete", verification.data.gateway_response || `Status: ${verification.data.status}`);
      return;
    }

    const hasIssues = await cleanUpCartItems(cartItemIds);
    setPendingOnlinePayment(null);
    clearCheckoutState();
    setStatusCard({
      tone: "success",
      title: "Payment successful",
      message: hasIssues
        ? `Payment ${reference} succeeded, but some cart items may reappear until the next refresh.`
        : `Payment ${reference} was verified successfully.`,
    });
    Alert.alert("Payment successful", "Your order has been confirmed.");
    navigation.navigate("Cart");
  };

  const handleContinue = () => {
    if (step === "cart") {
      if (cartItems.length === 0) {
        Alert.alert("Cart is empty", "Add some items before continuing.");
        return;
      }
      setStep("details");
      return;
    }

    if (step === "details") {
      if (!validateDetails()) return;
      setStep("payment");
    }
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;
    if (!form.paymentMethod) return;

    if (pendingOnlinePayment && isPhysicalPaymentMethod(form.paymentMethod)) {
      Alert.alert(
        "Pending online order",
        `Order #${pendingOnlinePayment.orderId} is already waiting for online payment. Resume that payment instead of switching it to physical payment.`,
      );
      return;
    }

    setIsSubmittingOrder(true);
    setStatusCard(null);

    try {
      const orderPaymentMethod = isPhysicalPaymentMethod(form.paymentMethod) ? "physical_payment" : "paystack";
      let orderId = isPhysicalPaymentMethod(form.paymentMethod)
        ? null
        : pendingOnlinePayment?.orderId || null;

      if (!orderId) {
        const orderResult = await createOrder({
          items: cartItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
          payment_method: orderPaymentMethod,
          shipping_address: buildShippingAddress(form),
          notes: buildOrderNotes(form, mobileProvider),
        });

        if (!orderResult.success || !orderResult.data?.id) {
          throw new Error(orderResult.message || "Unable to create order.");
        }

        orderId = Number(orderResult.data.id);
      }

      if (isPhysicalPaymentMethod(form.paymentMethod)) {
        await cleanUpCartItems(cartItems.map((item) => Number(item.cart_id)));
        clearCheckoutState();
        setStatusCard({
          tone: "success",
          title: "Order placed",
          message: `Order #${orderId} was created with ${formatPaymentMethodLabel(form.paymentMethod)}.`,
        });
        Alert.alert("Order placed", `Order #${orderId} was created successfully.`);
        navigation.navigate("Cart");
        return;
      }

      const paymentResult = await initializePayment({
        order_id: orderId,
        email: form.email.trim(),
        callback_url: callbackUrl,
        metadata: {
          checkout_payment_method: form.paymentMethod,
          shipping_method: form.shippingMethod,
          customer_name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
          phone: form.phone.trim(),
          mobile_provider: mobileProvider || undefined,
        },
      });

      if (!paymentResult.success || !paymentResult.data?.authorization_url || !paymentResult.data.reference) {
        throw new Error(paymentResult.message || "Unable to initialize payment.");
      }

      const cartItemIds = cartItems.map((item) => Number(item.cart_id)).filter((id) => Number.isFinite(id));

      setPendingOnlinePayment({
        orderId,
        reference: paymentResult.data.reference,
        paymentMethod: form.paymentMethod,
        cartItemIds,
        createdAt: new Date().toISOString(),
      });

      setStatusCard({
        tone: "default",
        title: "Redirecting to payment",
        message: "Complete the secure payment flow and return to the app.",
      });

      const authResult = await WebBrowser.openAuthSessionAsync(
        paymentResult.data.authorization_url,
        callbackUrl,
      );

      if (authResult.type !== "success") {
        setStatusCard({
          tone: "default",
          title: "Payment still pending",
          message: `Order #${orderId} is saved. Use the same button again to resume secure payment.`,
        });
        return;
      }

      const parsedUrl = Linking.parse(authResult.url);
      const returnedReference =
        typeof parsedUrl.queryParams?.reference === "string"
          ? parsedUrl.queryParams.reference
          : paymentResult.data.reference;

      await verifyAndFinalizePayment(returnedReference, cartItemIds);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to continue checkout.";
      setStatusCard({
        tone: "danger",
        title: "Checkout failed",
        message,
      });
      Alert.alert("Checkout failed", message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Screen contentContainerClassName="pt-8">
        <AuthPrompt
          title="Checkout needs your account"
          description="Sign in to create orders, initialize payments, and keep your cart synced with the backend."
        />
      </Screen>
    );
  }

  if (!isLoading && cartItems.length === 0) {
    return (
      <Screen contentContainerClassName="pt-8">
        <EmptyState
          title="No items ready for checkout"
          description="Your cart is empty. Add products before you continue."
          action={
            <Button onPress={() => navigation.navigate("Tabs", { screen: "Shop" })}>
              Browse products
            </Button>
          }
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerClassName="gap-5 pt-2 pb-10" showsVerticalScrollIndicator={false}>
          <CheckoutStepper step={step} />

          {statusCard ? (
            <Card className={`gap-2 ${statusCard.tone === "success" ? "bg-secondary" : statusCard.tone === "danger" ? "bg-rose-50" : ""}`}>
              <AppText weight="bold" className={statusCard.tone === "danger" ? "text-destructive" : statusCard.tone === "success" ? "text-primary" : ""}>
                {statusCard.title}
              </AppText>
              <AppText className={statusCard.tone === "danger" ? "text-rose-700" : "text-brand-subtext"}>
                {statusCard.message}
              </AppText>
            </Card>
          ) : null}

          {step === "cart" ? (
            <Card className="gap-4">
              <AppText weight="bold" className="text-xl">
                Review your items
              </AppText>
              {cartItems.map((item) => (
                <View key={item.cart_id} className="flex-row items-center justify-between gap-3">
                  <View className="flex-1">
                    <AppText weight="semibold">{item.name}</AppText>
                    <AppText className="text-sm text-brand-subtext">Qty {item.quantity}</AppText>
                  </View>
                  <AppText weight="semibold">{formatCurrency(item.totalPrice)}</AppText>
                </View>
              ))}
            </Card>
          ) : null}

          {step === "details" ? (
            <Card className="gap-4">
              <AppText weight="bold" className="text-xl">
                Delivery details
              </AppText>
              <TextField label="First name" value={form.firstName} onChangeText={(firstName) => updateForm({ firstName })} />
              <TextField label="Last name" value={form.lastName} onChangeText={(lastName) => updateForm({ lastName })} />
              <TextField
                label="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(email) => updateForm({ email })}
              />
              <TextField
                label="Phone"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(phone) => updateForm({ phone })}
              />
              <TextField
                label="Address"
                multiline
                value={form.address}
                onChangeText={(address) => updateForm({ address })}
              />
              <TextField label="City" value={form.city} onChangeText={(city) => updateForm({ city })} />
              <TextField label="Region" value={form.region} onChangeText={(region) => updateForm({ region })} />
              <TextField
                label="Postal code"
                value={form.postalCode}
                onChangeText={(postalCode) => updateForm({ postalCode })}
              />
              <View className="gap-2">
                <AppText weight="semibold" className="text-sm">
                  Shipping method
                </AppText>
                <View className="flex-row flex-wrap gap-3">
                  {[
                    { value: "standard", label: "Standard" },
                    { value: "express", label: "Express" },
                    { value: "pickup", label: "Pickup" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={form.shippingMethod === option.value ? "secondary" : "outline"}
                      onPress={() =>
                        updateForm({
                          shippingMethod: option.value as any,
                          ...(option.value === "pickup"
                            ? { address: "", city: "", region: "", postalCode: "" }
                            : {}),
                        })
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </View>
              </View>
              <View className="gap-2">
                <AppText weight="semibold" className="text-sm">
                  Payment method
                </AppText>
                <View className="flex-row flex-wrap gap-3">
                  {[
                    { value: "card", label: "Card" },
                    { value: "mobile", label: "Mobile money" },
                    { value: "cod", label: "Physical" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={form.paymentMethod === option.value ? "secondary" : "outline"}
                      onPress={() => updateForm({ paymentMethod: option.value as any })}
                    >
                      {option.label}
                    </Button>
                  ))}
                </View>
              </View>
            </Card>
          ) : null}

          {step === "payment" ? (
            <Card className="gap-4">
              <AppText weight="bold" className="text-xl">
                Payment
              </AppText>
              {form.paymentMethod === "card" ? (
                <View className="gap-4">
                  <View className="flex-row items-center gap-3">
                    <CreditCard color={palette.primary} size={20} />
                    <AppText className="text-sm text-brand-subtext">
                      Card details are collected only to guide the secure Paystack redirect.
                    </AppText>
                  </View>
                  <TextField label="Card holder name" value={cardName} onChangeText={setCardName} />
                  <TextField label="Card number" value={cardNumber} onChangeText={setCardNumber} keyboardType="number-pad" />
                  <View className="flex-row gap-3">
                    <TextField className="flex-1" label="Expiry" value={cardExpiry} onChangeText={setCardExpiry} />
                    <TextField className="flex-1" label="CVV" value={cardCvv} onChangeText={setCardCvv} secureTextEntry />
                  </View>
                </View>
              ) : null}
              {form.paymentMethod === "mobile" ? (
                <View className="gap-4">
                  <View className="flex-row items-center gap-3">
                    <Landmark color={palette.primary} size={20} />
                    <AppText className="text-sm text-brand-subtext">
                      Mobile money uses the same secure gateway callback flow as the web app.
                    </AppText>
                  </View>
                  <View className="flex-row flex-wrap gap-3">
                    {(["mtn", "airteltigo", "telecel"] as MobileProvider[]).map((provider) => (
                      <Button
                        key={provider}
                        variant={mobileProvider === provider ? "secondary" : "outline"}
                        onPress={() => setMobileProvider(provider)}
                      >
                        {provider.toUpperCase()}
                      </Button>
                    ))}
                  </View>
                  <TextField label="Mobile number" value={mobileNumber} onChangeText={setMobileNumber} keyboardType="phone-pad" />
                </View>
              ) : null}
              {form.paymentMethod === "cod" ? (
                <View className="gap-3 rounded-2xl bg-secondary p-4">
                  <View className="flex-row items-center gap-3">
                    <Truck color={palette.primary} size={20} />
                    <AppText weight="semibold" className="text-primary">
                      Physical payment selected
                    </AppText>
                  </View>
                  <AppText className="text-sm leading-6 text-primary">
                    Pay when your order is delivered or when you collect it. The order is still created and tracked in your account.
                  </AppText>
                </View>
              ) : null}
            </Card>
          ) : null}

          <Card className="gap-4">
            <AppText weight="bold" className="text-xl">
              Order summary
            </AppText>
            <View className="flex-row items-center justify-between">
              <AppText className="text-brand-subtext">Subtotal</AppText>
              <AppText weight="semibold">{formatCurrency(subtotal)}</AppText>
            </View>
            <View className="flex-row items-center justify-between">
              <AppText className="text-brand-subtext">Delivery</AppText>
              <AppText weight="semibold">{delivery === 0 ? "Free" : formatCurrency(delivery)}</AppText>
            </View>
            <View className="gap-2">
              <TextField
                label="Coupon code"
                value={couponCode}
                onChangeText={setCouponCode}
                placeholder="Optional"
              />
              <Button
                variant="outline"
                onPress={() =>
                  Alert.alert("Coupons", couponCode.trim() ? "That coupon is invalid or expired." : "Enter a coupon first.")
                }
              >
                Apply coupon
              </Button>
            </View>
            <View className="flex-row items-center justify-between border-t border-brand-line pt-4">
              <AppText weight="bold" className="text-lg">
                Total
              </AppText>
              <AppText weight="bold" className="text-2xl text-primary">
                {formatCurrency(total)}
              </AppText>
            </View>
            <Button
              onPress={step === "payment" ? handlePayment : handleContinue}
              disabled={isSubmittingOrder}
            >
              {isSubmittingOrder
                ? "Processing..."
                : step === "cart"
                  ? "Continue to details"
                  : step === "details"
                    ? "Continue to payment"
                    : pendingOnlinePayment
                      ? "Resume secure payment"
                      : "Complete checkout"}
            </Button>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};
