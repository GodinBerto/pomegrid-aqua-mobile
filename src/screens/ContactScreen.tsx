import { Alert, Linking, View } from "react-native";
import { Clock3, Mail, MapPin, MessageSquare, Phone } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { AppText, Button, Card, Screen, SectionHeading } from "@/components/ui";
import { palette } from "@/theme";

const contactItems = [
  {
    title: "Phone",
    value: "+234 123 456 7890",
    icon: Phone,
    action: "tel:+2341234567890",
  },
  {
    title: "Email",
    value: "support@fishfarm.com",
    icon: Mail,
    action: "mailto:support@fishfarm.com",
  },
  {
    title: "Location",
    value: "Lagos, Nigeria",
    icon: MapPin,
    action: "https://maps.google.com/?q=Lagos,Nigeria",
  },
];

export const ContactScreen = () => {
  const navigation = useNavigation<any>();

  const handleOpen = async (target: string) => {
    const canOpen = await Linking.canOpenURL(target);
    if (!canOpen) {
      Alert.alert("Unavailable", "This action is not available on your device.");
      return;
    }

    await Linking.openURL(target);
  };

  return (
    <Screen contentContainerClassName="pt-2 gap-6">
      <SectionHeading
        eyebrow="Contact"
        title="Reach the team without leaving the app"
        description="Phone, email, and live support are all surfaced on mobile so users always have a next step."
      />

      {contactItems.map((item) => {
        const Icon = item.icon;

        return (
          <Button key={item.title} variant="ghost" className="p-0" onPress={() => handleOpen(item.action)}>
            <Card className="w-full flex-row items-center gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Icon color={palette.primary} size={22} />
              </View>
              <View className="flex-1 items-start">
                <AppText weight="bold">{item.title}</AppText>
                <AppText className="text-sm text-brand-subtext">{item.value}</AppText>
              </View>
            </Card>
          </Button>
        );
      })}

      <Card className="gap-3">
        <View className="flex-row items-center gap-3">
          <Clock3 color={palette.primary} size={22} />
          <AppText weight="bold" className="text-lg">
            Business hours
          </AppText>
        </View>
        <AppText className="text-sm leading-6 text-brand-subtext">
          Monday - Friday: 8am - 6pm
        </AppText>
        <AppText className="text-sm leading-6 text-brand-subtext">
          Saturday: 9am - 4pm
        </AppText>
        <AppText className="text-sm leading-6 text-brand-subtext">
          Sunday: Closed
        </AppText>
      </Card>

      <Card className="gap-4 bg-primary">
        <View className="gap-2">
          <AppText weight="bold" className="text-xl text-white">
            Prefer messaging?
          </AppText>
          <AppText className="text-sm leading-6 text-white/80">
            Use the live chat to keep support tied to your account and conversation history.
          </AppText>
        </View>
        <Button variant="secondary" onPress={() => navigation.navigate("Chat")}>
          <View className="flex-row items-center justify-center gap-2">
            <MessageSquare color={palette.primary} size={18} />
            <AppText weight="semibold" className="text-primary">
              Open live chat
            </AppText>
          </View>
        </Button>
      </Card>
    </Screen>
  );
};
