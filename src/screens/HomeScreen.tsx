import { ScrollView, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, MessageCircle, Sprout, Truck, Wrench } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { marketingImages } from "@/constants/media";
import { ProductCard } from "@/components/ProductCard";
import { AppText, Button, Card, LoadingState, Screen, SectionHeading } from "@/components/ui";
import { useProducts } from "@/hooks/useAppData";
import { palette } from "@/theme";

const heroSlides = [
  {
    title: "Premium Catfish",
    description: "Fingerlings and mature stock for fast, healthy farm growth.",
    image: marketingImages.catfish,
    category: "Fish",
  },
  {
    title: "Healthy Tilapia",
    description: "Reliable aquaculture stock with the support to match.",
    image: marketingImages.tilapia,
    category: "Fish",
  },
];

const categoryCards = [
  {
    title: "Fish",
    description: "Catfish, tilapia, fingerlings, and mature stock.",
    image: marketingImages.catfish,
  },
  {
    title: "Live Stock",
    description: "Healthy livestock sourced for quality and consistency.",
    image: marketingImages.livestock,
  },
  {
    title: "Vegetables",
    description: "Fresh harvests delivered straight from the farm.",
    image: marketingImages.vegetables,
  },
  {
    title: "Fruits",
    description: "Juicy seasonal produce with reliable fulfillment.",
    image: marketingImages.fruits,
  },
  {
    title: "Farm Equipment",
    description: "Pumps, tanks, and tools that keep farms running.",
    image: marketingImages.equipment,
  },
];

const highlights = [
  {
    title: "Farm-ready quality",
    description: "Products are curated for healthy stock, dependable equipment, and repeat orders.",
    icon: Sprout,
  },
  {
    title: "Reliable delivery",
    description: "Order flows, chat, and checkout are streamlined for fast decision making.",
    icon: Truck,
  },
  {
    title: "Hands-on support",
    description: "Live chat connects users directly with customer support when they need help.",
    icon: Wrench,
  },
];

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { data: products = [], isLoading } = useProducts();

  const featuredProducts =
    products.filter((product) => product.rating && (product.rating >= 4.8 || product.isFeatured)).slice(0, 6) ||
    [];

  const previewProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 6);

  return (
    <Screen contentContainerClassName="pt-2 gap-8">
      <SectionHeading
        eyebrow="Aqua Market"
        title="Your farm shop, now mobile"
        description="Browse stock, services, orders, and support with the same green brand system as the web app."
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
        {heroSlides.map((slide) => (
          <View key={slide.title} className="mr-4 w-[320px] overflow-hidden rounded-[28px]">
            <Image source={slide.image} style={{ width: "100%", height: 220 }} contentFit="cover" />
            <LinearGradient
              colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.65)"]}
              style={{ position: "absolute", inset: 0, justifyContent: "flex-end", padding: 20 }}
            >
              <AppText weight="bold" className="text-3xl leading-9 text-white">
                {slide.title}
              </AppText>
              <AppText className="mt-2 text-sm leading-6 text-white/90">{slide.description}</AppText>
              <Button
                size="sm"
                className="mt-5 self-start"
                onPress={() => navigation.navigate("Shop", { category: slide.category })}
              >
                Explore
              </Button>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      <View>
        <SectionHeading title="Shop by category" description="Jump into the catalog with the filters users already know from the web app." />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
          {categoryCards.map((category) => (
            <Button
              key={category.title}
              variant="ghost"
              className="mr-4 w-[220px] p-0"
              onPress={() => navigation.navigate("Shop", { category: category.title })}
            >
              <Card className="w-full overflow-hidden p-0">
                <Image source={category.image} style={{ width: "100%", height: 130 }} contentFit="cover" />
                <View className="gap-2 p-4">
                  <AppText weight="bold" className="text-lg">
                    {category.title}
                  </AppText>
                  <AppText className="text-sm leading-6 text-brand-subtext">{category.description}</AppText>
                </View>
              </Card>
            </Button>
          ))}
        </ScrollView>
      </View>

      <View className="gap-4">
        <SectionHeading
          title="Featured products"
          description="A mobile-friendly slice of your storefront with cached data from React Query."
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
        ) : (
          <View className="gap-4">
            {previewProducts.map((product) => (
              <ProductCard
                key={String(product.id)}
                product={product}
                onPress={() =>
                  navigation.navigate("ProductDetails", {
                    productId: String(product.id),
                    title: product.title,
                  })
                }
              />
            ))}
          </View>
        )}
      </View>

      <View className="gap-4">
        <SectionHeading title="Why users stay here" description="The mobile experience keeps the same business value while feeling native on smaller screens." />
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
              <AppText className="text-sm leading-6 text-brand-subtext">{highlight.description}</AppText>
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
            Start a live conversation with support, ask product questions, and keep the thread cached across sessions.
          </AppText>
        </View>
        <View className="flex-row gap-3">
          <Button variant="secondary" className="flex-1" onPress={() => navigation.navigate("Chat")}>
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
