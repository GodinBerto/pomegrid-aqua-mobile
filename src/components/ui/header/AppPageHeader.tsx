import { useMemo } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Bell, MessageCircle, ShoppingCart } from "lucide-react-native";
import { View } from "react-native";
import { getConversationUnreadCount } from "@/lib/utils";
import { useCartQuery, useSessionUser, useSupportConversation } from "@/query";
import { AppText } from "../AppText";
import { UserProfileHeader } from "../user/UserProfileHeader";
import { HeaderIconButton } from "./HeaderIconButton";

const getFirstName = (
  user?: {
    full_name?: string;
    username?: string;
    email?: string;
  } | null,
) => {
  const fullName = user?.full_name?.trim();
  if (fullName) return fullName.split(/\s+/)[0];

  const username = user?.username?.trim();
  if (username) return username.split(/[._\s-]+/)[0];

  const email = user?.email?.trim();
  if (email) return email.split("@")[0];

  return "Farmer";
};

const getRouteHeaderCopy = (
  routeName: string,
  routeParams: Record<string, unknown> | undefined,
  firstName: string,
) => {
  switch (routeName) {
    case "Explore":
      return {
        title: firstName,
        subtitle: "Welcome back!",
      };
    case "Shop":
      return {
        title: "Shop",
        subtitle: "Find stock, produce, and equipment",
      };
    case "Calculator":
      return {
        title: "Calculator",
        subtitle: "Run the numbers before you buy",
      };
    case "Services":
      return {
        title: "Services",
        subtitle: "Get hands-on aquaculture support",
      };
    case "ProductDetails":
      return {
        title:
          typeof routeParams?.title === "string"
            ? routeParams.title
            : "Product details",
        subtitle: "Review this item before ordering",
      };
    case "Cart":
      return {
        title: "Cart",
        subtitle: "Review what you are taking to checkout",
      };
    case "Checkout":
      return {
        title: "Checkout",
        subtitle: "Complete your order details and payment",
      };
    case "Chat":
      return {
        title: "Support",
        subtitle: "Your messages stay tied to your account",
      };
    case "About":
      return {
        title: "About",
        subtitle: "See the story behind the brand",
      };
    case "Contact":
      return {
        title: "Contact",
        subtitle: "Reach the team from one place",
      };
    default:
      return {
        title: "Pomegrid Aqua",
        subtitle: "Your farm storefront on mobile",
      };
  }
};

export const AppPageHeader = ({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user, isAuthenticated, isBootstrapping } = useSessionUser();
  const { data: cartItems = [] } = useCartQuery(
    isAuthenticated && !isBootstrapping,
  );
  const { data: supportConversation } = useSupportConversation(
    isAuthenticated && !isBootstrapping,
  );

  const firstName = useMemo(() => getFirstName(user), [user]);
  const headerCopy = useMemo(
    () =>
      getRouteHeaderCopy(route.name, route.params as Record<string, unknown>, firstName),
    [firstName, route.name, route.params],
  );

  const resolvedTitle = title || headerCopy.title;
  const resolvedSubtitle = subtitle || headerCopy.subtitle;
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const unreadCount = getConversationUnreadCount(supportConversation);

  const openSettings = () => {
    navigation.navigate("Tabs", { screen: "Settings" });
  };

  const openChat = () => {
    navigation.navigate("Chat");
  };

  const openCart = () => {
    navigation.navigate("Cart");
  };

  return (
    <View className="mt-5 flex-row items-center justify-between gap-4">
      <View className="flex-1">
        {isAuthenticated ? (
          <View className="flex-row items-center gap-3">
            <UserProfileHeader avatarUrl="" onPress={openSettings} />
            <View className="flex-1">
              <AppText className="text-sm text-brand-subtext">
                {resolvedSubtitle}
              </AppText>
              <AppText
                weight="bold"
                className="mt-0.5 text-[30px] leading-9"
              >
                {resolvedTitle}
              </AppText>
            </View>
          </View>
        ) : (
          <UserProfileHeader avatarUrl={undefined} onPress={openSettings} />
        )}
      </View>
      <View className="flex-row items-center gap-3">
        <HeaderIconButton
          icon={Bell}
          accessibilityLabel="Open support updates"
          hasNotification={unreadCount > 0}
          onPress={openChat}
        />
        <HeaderIconButton
          icon={MessageCircle}
          accessibilityLabel="Open support chat"
          onPress={openChat}
        />
        <HeaderIconButton
          icon={ShoppingCart}
          accessibilityLabel="Open cart"
          hasNotification={cartCount > 0}
          onPress={openCart}
        />
      </View>
    </View>
  );
};
