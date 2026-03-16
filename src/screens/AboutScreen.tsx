import { View } from "react-native";
import { Fish, GraduationCap, Truck, Users } from "lucide-react-native";
import { AppText, Card, Screen, SectionHeading } from "@/components/ui";
import { palette } from "@/theme";

const values = [
  {
    title: "Quality assurance",
    description: "Healthy stock, tested equipment, and consistent inventory presentation from browse to checkout.",
    icon: Fish,
  },
  {
    title: "Reliable delivery",
    description: "The shopping flow keeps users informed through cart, checkout, payment, and order history.",
    icon: Truck,
  },
  {
    title: "Expert support",
    description: "Live chat and services give buyers a clear path to advice instead of forcing them off-platform.",
    icon: GraduationCap,
  },
  {
    title: "Community focus",
    description: "The user app stays centered on practical farm outcomes and ongoing customer relationships.",
    icon: Users,
  },
];

export const AboutScreen = () => (
  <Screen contentContainerClassName="pt-2 gap-6">
    <SectionHeading
      eyebrow="About"
      title="Pomegrid Aqua grows from the same mission as your web app"
      description="The mobile experience keeps the sustainability, support, and premium-stock story intact while making it easier to shop and chat on the go."
    />

    <Card className="gap-3">
      <AppText weight="bold" className="text-xl">
        Our story
      </AppText>
      <AppText className="text-sm leading-6 text-brand-subtext">
        What started as a farm-first storefront has expanded into a full user journey: product discovery, services, live support, and order management in one place. The app stays focused on practical aquaculture outcomes instead of generic ecommerce fluff.
      </AppText>
    </Card>

    <View className="gap-4">
      {values.map((value) => {
        const Icon = value.icon;

        return (
          <Card key={value.title} className="gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <Icon color={palette.primary} size={24} />
            </View>
            <AppText weight="bold" className="text-lg">
              {value.title}
            </AppText>
            <AppText className="text-sm leading-6 text-brand-subtext">{value.description}</AppText>
          </Card>
        );
      })}
    </View>

    <Card className="gap-3 bg-secondary">
      <AppText weight="bold" className="text-xl text-primary">
        Mission
      </AppText>
      <AppText className="text-sm leading-6 text-primary">
        Deliver sustainable aquaculture products and support with a user experience that feels direct, modern, and trustworthy on every screen size.
      </AppText>
    </Card>
  </Screen>
);
