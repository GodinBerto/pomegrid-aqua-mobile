import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Calculator,
  Home,
  MessagesSquare,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Wrench,
} from "lucide-react-native";
import { useCartQuery, useSupportConversation } from "@/hooks/useAppData";
import { getConversationUnreadCount } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { fontFamilies, navigationTheme, palette } from "@/theme";
import type { ProductCategory } from "@/types/domain";
import { AboutScreen } from "@/app/screens/AboutScreen";
import { AccountScreen } from "@/app/screens/AccountScreen";
import { ChatScreen } from "@/app/screens/ChatScreen";
import { CheckoutScreen } from "@/app/screens/CheckoutScreen";
import { CalculatorScreen } from "@/app/screens/CalculatorScreen";
import { ContactScreen } from "@/app/screens/ContactScreen";
import { HomeScreen } from "@/app/screens/HomeScreen";
import { LoginScreen } from "@/app/screens/LoginScreen";
import { ProductDetailScreen } from "@/app/screens/ProductDetailScreen";
import { ProductsScreen } from "@/app/screens/ProductsScreen";
import { RegisterScreen } from "@/app/screens/RegisterScreen";
import { ServicesScreen } from "@/app/screens/ServicesScreen";

export type RootTabParamList = {
  Explore: undefined;
  Shop: { category?: ProductCategory | "all" } | undefined;
  Calculator: undefined;
  Services: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  ProductDetails: { productId: string; title?: string };
  Services: undefined;
  About: undefined;
  Contact: undefined;
  Checkout: undefined;
  Calculator: undefined;
  Login: undefined;
  Register: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const iconMap = {
  Explore: Home,
  Shop: ShoppingBag,
  Settings: Settings,
  Calculator: Calculator,
  Services: Wrench,
} as const;

const TabsNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const { data: cartItems = [] } = useCartQuery(
    isAuthenticated && !isBootstrapping,
  );
  const { data: supportConversation } = useSupportConversation(
    isAuthenticated && !isBootstrapping,
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const unreadCount = getConversationUnreadCount(supportConversation);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const Icon = iconMap[route.name];

        return {
          headerShown: false,
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: palette.subtext,
          tabBarStyle: {
            backgroundColor: palette.surface,
            borderTopColor: palette.border,
            paddingTop: 10,
            paddingBottom: 12,
            height: 82,
          },
          tabBarLabelStyle: {
            fontFamily: fontFamilies.semibold,
            fontSize: 12,
          },
          tabBarIcon: ({ color, size }) => <Icon color={color} size={size} />,
          tabBarBadgeStyle: {
            backgroundColor: palette.primary,
            color: "#FFFFFF",
            fontFamily: fontFamilies.bold,
          },
        };
      }}
    >
      <Tab.Screen name="Explore" component={HomeScreen} />
      <Tab.Screen name="Shop" component={ProductsScreen} />
      <Tab.Screen
        name="Calculator"
        component={CalculatorScreen}
        options={{
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen name="Settings" component={AccountScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => (
  <NavigationContainer theme={navigationTheme}>
    <Stack.Navigator
      screenOptions={{
        headerTintColor: palette.ink,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: palette.surface,
        },

        headerTitleStyle: {
          fontFamily: fontFamilies.bold,
        },
        contentStyle: {
          backgroundColor: palette.canvas,
        },
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={TabsNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailScreen}
        options={({ route }) => ({
          title: route.params?.title || "Product details",
        })}
      />
      <Stack.Screen name="Services" component={ServicesScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen
        name="Calculator"
        component={CalculatorScreen}
        options={{ title: "Farm calculator" }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          presentation: "modal",
          title: "Sign in",
          headerTitleStyle: {
            fontFamily: fontFamilies.bold,
            // paddingTop: 10,
          },
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ presentation: "modal", title: "Create account" }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);
