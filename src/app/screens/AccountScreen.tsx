import React from "react";
import { Alert, View } from "react-native";
import { ArrowRight, Bell, Globe2, LogOut, Mail, Settings2, UserRound } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { OrderCard } from "@/components/OrderCard";
import { AppText, AuthPrompt, Badge, Button, Card, LoadingState, Screen, SectionHeading } from "@/components/ui";
import { useLogoutMutation, useOrdersQuery, useSessionUser } from "@/query";
import { formatDate } from "@/lib/utils";
import { usePreferencesStore } from "@/store/preferencesStore";
import { palette } from "@/theme";

export const AccountScreen = () => {
  const navigation = useNavigation<any>();
  const { user, isAuthenticated } = useSessionUser();
  const { data: orders = [], isLoading } = useOrdersQuery(isAuthenticated);
  const logoutMutation = useLogoutMutation();
  const [expandedOrderId, setExpandedOrderId] = React.useState<number | null>(null);
  const { currency, language, timezone, notifications, setCurrency, setLanguage, setTimezone, updateNotifications } =
    usePreferencesStore();

  const handleLogout = () => {
    Alert.alert("Sign out", "Do you want to sign out of the mobile app?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => logoutMutation.mutate(),
      },
    ]);
  };

  if (!isAuthenticated || !user) {
    return (
      <Screen showAppHeader={false} contentContainerClassName="pt-8 gap-4">
        <AuthPrompt
          title="Your profile lives here"
          description="Sign in to see orders, account details, preferences, and your cached session state."
        />
        <Card className="gap-3">
          <Button variant="outline" onPress={() => navigation.navigate("About")}>
            Learn about the farm brand
          </Button>
          <Button variant="outline" onPress={() => navigation.navigate("Contact")}>
            Contact support
          </Button>
          <Button variant="outline" onPress={() => navigation.navigate("Services")}>
            Explore services
          </Button>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen showAppHeader={false} contentContainerClassName="pt-2 gap-6">
      <SectionHeading
        eyebrow="Account"
        title={user.full_name}
        description="Your profile, settings, and user-side order history live together on mobile."
      />

      <Card className="gap-4">
        <View className="flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <UserRound color={palette.primary} size={30} />
          </View>
          <View className="flex-1">
            <AppText weight="bold" className="text-xl">
              {user.full_name}
            </AppText>
            <AppText className="text-sm text-brand-subtext">{user.email}</AppText>
            <View className="mt-2 flex-row flex-wrap gap-2">
              <Badge label={String(user.user_type || "Customer")} />
              <Badge label={user.is_active ? "Active" : "Pending"} tone={user.is_active ? "success" : "warning"} />
            </View>
          </View>
        </View>
        <View className="gap-2 rounded-2xl bg-secondary p-4">
          <View className="flex-row items-center justify-between">
            <AppText className="text-brand-subtext">Phone</AppText>
            <AppText weight="semibold">{user.phone || "Not provided"}</AppText>
          </View>
          <View className="flex-row items-center justify-between">
            <AppText className="text-brand-subtext">Address</AppText>
            <AppText weight="semibold">{user.address || "Not provided"}</AppText>
          </View>
          <View className="flex-row items-center justify-between">
            <AppText className="text-brand-subtext">Date of birth</AppText>
            <AppText weight="semibold">{formatDate(user.date_of_birth)}</AppText>
          </View>
        </View>
      </Card>

      <Card className="gap-4">
        <View className="flex-row items-center gap-3">
          <Bell color={palette.primary} size={20} />
          <AppText weight="bold" className="text-lg">
            Notification preferences
          </AppText>
        </View>
        {[
          { label: "Email notifications", key: "email" as const, value: notifications.email },
          { label: "Order updates", key: "orders" as const, value: notifications.orders },
          { label: "Promotions", key: "promotions" as const, value: notifications.promotions },
          { label: "SMS alerts", key: "sms" as const, value: notifications.sms },
        ].map((item) => (
          <View key={item.key} className="flex-row items-center justify-between">
            <AppText className="text-sm text-brand-subtext">{item.label}</AppText>
            <Button
              size="sm"
              variant={item.value ? "secondary" : "outline"}
              onPress={() => updateNotifications({ [item.key]: !item.value })}
            >
              {item.value ? "On" : "Off"}
            </Button>
          </View>
        ))}
      </Card>

      <Card className="gap-4">
        <View className="flex-row items-center gap-3">
          <Globe2 color={palette.primary} size={20} />
          <AppText weight="bold" className="text-lg">
            Preferences
          </AppText>
        </View>
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <AppText className="text-brand-subtext">Language</AppText>
            <Button size="sm" variant="outline" onPress={() => setLanguage(language === "English" ? "French" : "English")}>
              {language}
            </Button>
          </View>
          <View className="flex-row items-center justify-between">
            <AppText className="text-brand-subtext">Currency</AppText>
            <Button size="sm" variant="outline" onPress={() => setCurrency(currency === "USD" ? "EUR" : "USD")}>
              {currency}
            </Button>
          </View>
          <View className="flex-row items-center justify-between">
            <AppText className="text-brand-subtext">Timezone</AppText>
            <Button
              size="sm"
              variant="outline"
              onPress={() =>
                setTimezone(
                  timezone === "America/New_York" ? "America/Chicago" : "America/New_York",
                )
              }
            >
              {timezone === "America/New_York" ? "Eastern" : "Central"}
            </Button>
          </View>
        </View>
      </Card>

      <Card className="gap-4">
        <View className="flex-row items-center gap-3">
          <Settings2 color={palette.primary} size={20} />
          <AppText weight="bold" className="text-lg">
            Order history
          </AppText>
        </View>
        {isLoading ? (
          <LoadingState label="Loading orders..." />
        ) : orders.length === 0 ? (
          <AppText className="text-sm text-brand-subtext">You haven’t placed any orders yet.</AppText>
        ) : (
          <View className="gap-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={expandedOrderId === order.id}
                onToggle={() =>
                  setExpandedOrderId((current) => (current === order.id ? null : order.id))
                }
              />
            ))}
          </View>
        )}
      </Card>

      <Card className="gap-3">
        <Button variant="outline" onPress={() => navigation.navigate("Services")}>
          <View className="flex-row items-center justify-center gap-2">
            <Mail color={palette.primary} size={18} />
            <AppText weight="semibold" className="text-primary">
              Explore services
            </AppText>
            <ArrowRight color={palette.primary} size={18} />
          </View>
        </Button>
        <Button variant="outline" onPress={() => navigation.navigate("About")}>
          Learn about Pomegrid Aqua
        </Button>
        <Button variant="outline" onPress={() => navigation.navigate("Contact")}>
          Contact the team
        </Button>
        <Button variant="destructive" onPress={handleLogout} disabled={logoutMutation.isPending}>
          <View className="flex-row items-center justify-center gap-2">
            <LogOut color="#FFFFFF" size={18} />
            <AppText weight="semibold" className="text-white">
              {logoutMutation.isPending ? "Signing out..." : "Sign out"}
            </AppText>
          </View>
        </Button>
      </Card>
    </Screen>
  );
};
