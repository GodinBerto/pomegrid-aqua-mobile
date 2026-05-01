import { useNavigation } from "@react-navigation/native";
import { Bell, MessageCircle, Search, ShoppingCart } from "lucide-react-native";
import { View } from "react-native";
import { AppText } from "../AppText";
import { UserProfileHeader } from "../user/UserProfileHeader";
import { HeaderIconButton } from "./HeaderIconButton";

export const WelcomeHeader = ({
  title,
  subtitle = "Welcome back!",
  onSearchPress,
  onNotificationPress,
  notificationCount = 0,
  isAutenticated,
  isAuthenticated,
}: {
  title: string;
  subtitle?: string;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
  isAutenticated?: boolean;
  isAuthenticated?: boolean;
}) => {
  const navigation = useNavigation<any>();
  const authenticated = isAuthenticated ?? isAutenticated ?? false;

  return (
    <View>
      <View className="mt-5 flex-row items-center justify-between gap-4">
        <View className="flex-1">
          {authenticated ? (
            <View>
              <UserProfileHeader avatarUrl="" />
              <View>
                <AppText className="text-sm text-brand-subtext">
                  {subtitle}
                </AppText>
                <AppText weight="bold" className="mt-0.5 text-[30px] leading-9">
                  {title}
                </AppText>
              </View>
            </View>
          ) : (
            <UserProfileHeader
              avatarUrl={undefined}
              onPress={() => navigation.navigate("Login")}
            />
          )}
        </View>
        <View className="flex-row items-center gap-3">
          <HeaderIconButton
            icon={Bell}
            accessibilityLabel="Open notifications"
            hasNotification={notificationCount > 0}
            onPress={onNotificationPress}
          />
          <HeaderIconButton
            icon={MessageCircle}
            accessibilityLabel="Sign in"
            onPress={onSearchPress}
          />
          <HeaderIconButton
            icon={ShoppingCart}
            accessibilityLabel="Sign in"
            onPress={onSearchPress}
          />
        </View>
      </View>

      <View className="mt-10">
        <View>
          <AppText weight="bold" className="mt-0.5 text-[19px] leading-9">
            What are you looking for today?
          </AppText>
        </View>
        <View className="mt-3 flex-row items-center gap-3 rounded-full border border-brand-line bg-white px-4 py-3">
          <Search size={18} className="text-brand-subtext" />
          <AppText className="flex-1 text-sm text-brand-subtext">
            Search products, categories...
          </AppText>
        </View>
      </View>
    </View>
  );
};
