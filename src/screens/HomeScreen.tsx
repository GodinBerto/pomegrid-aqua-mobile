import React from "react";
import { FlatList, ImageBackground, ScrollView, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  Calculator,
  MessageCircle,
  Sprout,
  Truck,
  Wrench,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { getCategoryArt, marketingImages } from "@/constants/media";
import { ProductCard } from "@/components/ProductCard";
import {
  AppText,
  Button,
  Card,
  LoadingState,
  Screen,
  SectionHeading,
  WelcomeHeader,
} from "@/components/ui";
import { useProducts, useSupportConversation } from "@/hooks/useAppData";
import { getConversationUnreadCount } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { palette } from "@/theme";

const heroSlides = [
  {
    title: "Fish",
    description: "Fingerlings and mature stock for fast, healthy farm growth.",
    image: marketingImages.catfish,
    category: "Fish",
  },
  {
    title: "Farm Equipment",
    description: "Pumps, tanks, and tools that keep farms running.",
    image: marketingImages.equipment,
    category: "Farm Equipment",
  },
];

const categoryCards = [
  {
    title: "Fish",
    description: "Catfish, tilapia, fingerlings, and mature stock.",
  },
  {
    title: "Live Stock",
    description: "Healthy livestock sourced for quality and consistency.",
  },
  {
    title: "Vegetables",
    description: "Fresh harvests delivered straight from the farm.",
  },
  {
    title: "Fruits",
    description: "Juicy seasonal produce with reliable fulfillment.",
  },
  {
    title: "Farm Equipment",
    description: "Pumps, tanks, and tools that keep farms running.",
  },
];

const highlights = [
  {
    title: "Farm-ready quality",
    description:
      "Products are curated for healthy stock, dependable equipment, and repeat orders.",
    icon: Sprout,
  },
  {
    title: "Reliable delivery",
    description:
      "Order flows, chat, and checkout are streamlined for fast decision making.",
    icon: Truck,
  },
  {
    title: "Hands-on support",
    description:
      "Live chat connects users directly with customer support when they need help.",
    icon: Wrench,
  },
];

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: products = [], isLoading } = useProducts();
  const { data: supportConversation } = useSupportConversation(isAuthenticated);

  const previewProducts = React.useMemo(() => {
    const featuredProducts = products
      .filter(
        (product) =>
          product.rating && (product.rating >= 4.8 || product.isFeatured),
      )
      .slice(0, 6);

    return featuredProducts.length > 0
      ? featuredProducts
      : products.slice(0, 6);
  }, [products]);

  const firstName = React.useMemo(() => {
    const fullName = user?.full_name?.trim();
    if (fullName) return fullName.split(/\s+/)[0];

    const username = user?.username?.trim();
    if (username) return username.split(/[._\s-]+/)[0];

    const email = user?.email?.trim();
    if (email) return email.split("@")[0];

    return "Farmer";
  }, [user?.email, user?.full_name, user?.username]);

  const unreadCount = getConversationUnreadCount(supportConversation);

  return (
    <Screen
      header={
        <WelcomeHeader
          title={firstName}
          isAuthenticated={isAuthenticated}
          notificationCount={unreadCount}
          onSearchPress={() => navigation.navigate("Shop")}
          onNotificationPress={() =>
            navigation.navigate(isAuthenticated ? "Chat" : "Account")
          }
        />
      }
      contentContainerClassName="gap-8 pt-2"
    >
      {/* <SectionHeading
        eyebrow="Pomegrid Aqua"
        title="Your farm shop, now mobile"
        description="Browse stock, services, orders, and support with the same green brand system as the web app."
      /> */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-ml-5 px-5 mt-10"
      >
        {heroSlides.map((slide) => (
          <View
            key={slide.title}
            className="mr-4 w-[320px] overflow-hidden rounded-[28px]"
          >
            <Image
              source={slide.image}
              style={{ width: "100%", height: 220 }}
              contentFit="cover"
            />
            <LinearGradient
              colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.65)"]}
              style={{
                position: "absolute",
                inset: 0,
                justifyContent: "flex-end",
                padding: 20,
              }}
            >
              <AppText weight="bold" className="text-3xl leading-9 text-white">
                {slide.title}
              </AppText>
              <AppText className="mt-2 text-sm leading-6 text-white/90">
                {slide.description}
              </AppText>
              <Button
                size="sm"
                className="mt-5 self-start"
                onPress={() =>
                  navigation.navigate("Shop", { category: slide.category })
                }
              >
                Explore
              </Button>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      <View className="gap-4">
        <SectionHeading
          title="Featured products"
          description=""
          action={
            <Button variant="ghost" onPress={() => navigation.navigate("Shop")}>
              <View className="flex-row items-center gap-2">
                <AppText weight="semibold" className="text-primary">
                  View all
                </AppText>
                <ArrowRight color={palette.primary} size={18} />
              </View>
            </Button>
          }
        />
        {isLoading ? (
          <LoadingState label="Loading featured products..." />
        ) : previewProducts.length === 0 ? (
          <Card>
            <AppText className="text-sm text-brand-subtext">
              No featured products are available yet.
            </AppText>
          </Card>
        ) : (
          <FlatList
            data={previewProducts}
            horizontal
            showsHorizontalScrollIndicator={false}
            removeClippedSubviews
            initialNumToRender={2}
            maxToRenderPerBatch={3}
            windowSize={3}
            keyExtractor={(product) => String(product.id)}
            className="-mx-5"
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={({ item: product, index }) => (
              <View
                className="w-[280px]"
                style={{
                  marginRight: index === previewProducts.length - 1 ? 0 : 16,
                }}
              >
                <ProductCard
                  product={product}
                  onPress={() =>
                    navigation.navigate("ProductDetails", {
                      productId: String(product.id),
                      title: product.title,
                    })
                  }
                />
              </View>
            )}
          />
        )}
      </View>

      <Card
        className={`overflow-hidden p-0 bg-url('${marketingImages.calculator}') bg-no-repeat bg-cover`}
      >
        <ImageBackground
          source={marketingImages.calculator}
          resizeMode="cover"
          style={{ padding: 20 }}
        >
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <View className="self-start rounded-full bg-white/15 px-3 py-1.5">
                <AppText
                  weight="semibold"
                  className="text-xs uppercase tracking-[1.2px] text-white/90"
                >
                  Farm Tool
                </AppText>
              </View>
              <AppText
                weight="bold"
                className="mt-4 text-2xl leading-8 text-white"
              >
                Plan your pond before you buy
              </AppText>
              <AppText className="mt-2 text-sm leading-6 text-white/80">
                Open the mobile calculator to estimate feed bags, stocking
                density, and pond size from the same logic used on the web app.
              </AppText>
            </View>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-white/15">
              <Calculator color="#FFFFFF" size={24} />
            </View>
          </View>

          <View className="mt-5 flex-row gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onPress={() => navigation.navigate("Calculator")}
            >
              <AppText weight="semibold" className="text-primary">
                Open calculator
              </AppText>
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-white/30 bg-transparent"
              onPress={() => navigation.navigate("Services")}
            >
              <AppText weight="semibold" className="text-white">
                View services
              </AppText>
            </Button>
          </View>
        </ImageBackground>
      </Card>

      <View className="gap-4">
        <SectionHeading
          title="Why users stay here"
          description="The mobile experience keeps the same business value while feeling native on smaller screens."
        />
        {highlights.map((highlight) => {
          const Icon = highlight.icon;

          return (
            <Card key={highlight.title} className="gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Icon color={palette.primary} size={22} />
              </View>
              <AppText weight="bold" className="text-lg">
                {highlight.title}
              </AppText>
              <AppText className="text-sm leading-6 text-brand-subtext">
                {highlight.description}
              </AppText>
            </Card>
          );
        })}
      </View>

      <Card className="gap-4 bg-primary">
        <View className="gap-2">
          <AppText weight="bold" className="text-2xl text-white">
            Need help before you order?
          </AppText>
          <AppText className="text-sm leading-6 text-white/80">
            Start a live conversation with support, ask product questions, and
            keep the thread cached across sessions.
          </AppText>
        </View>
        <View className="flex-row gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onPress={() => navigation.navigate("Chat")}
          >
            <View className="flex-row items-center justify-center gap-2">
              <MessageCircle color={palette.primary} size={18} />
              <AppText weight="semibold" className="text-primary">
                Open chat
              </AppText>
            </View>
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-white/40 bg-transparent"
            onPress={() => navigation.navigate("Services")}
          >
            <AppText weight="semibold" className="text-white">
              View services
            </AppText>
          </Button>
        </View>
      </Card>
    </Screen>
  );
};
