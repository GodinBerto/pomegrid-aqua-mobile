import React from "react";
import { Alert, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Calculator, GraduationCap, Settings, Users, Wrench } from "lucide-react-native";
import { AppText, Button, Card, LoadingState, Screen, SectionHeading, TextField } from "@/components/ui";
import { useFarmServices } from "@/query";
import type { ServiceIconKey } from "@/types/domain";
import { palette } from "@/theme";

const serviceIconMap: Record<ServiceIconKey, typeof Users> = {
  users: Users,
  settings: Settings,
  graduationCap: GraduationCap,
  wrench: Wrench,
};

export const ServicesScreen = () => {
  const navigation = useNavigation<any>();
  const { data: services = [], isLoading, error } = useFarmServices();
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.service || !form.message) {
      Alert.alert("Missing details", "Fill in your name, email, service, and message.");
      return;
    }

    Alert.alert(
      "Request received",
      "Your service request has been captured in the mobile app flow. You can also continue the conversation in live chat.",
    );
    setForm({
      name: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    });
  };

  return (
    <Screen contentContainerClassName="pt-2 gap-6">
      <SectionHeading
        eyebrow="Services"
        title="Professional aquaculture services"
        description="This screen mirrors the web app’s user-side services area with API-backed cards and a mobile request form."
      />

      <Card className="gap-4 bg-secondary">
        <View className="flex-row items-start gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-white">
            <Calculator color={palette.primary} size={22} />
          </View>
          <View className="flex-1">
            <AppText weight="bold" className="text-lg">
              Need to size a pond first?
            </AppText>
            <AppText className="text-sm leading-6 text-brand-subtext">
              Open the farm calculator to estimate stocking density, pond size, and feed before you submit a service request.
            </AppText>
          </View>
        </View>
        <Button onPress={() => navigation.navigate("Calculator")}>Open calculator</Button>
      </Card>

      {isLoading ? (
        <LoadingState label="Loading services..." />
      ) : error ? (
        <Card>
          <AppText className="text-destructive">{error.message}</AppText>
        </Card>
      ) : (
        <View className="gap-4">
          {services.map((service) => {
            const Icon = serviceIconMap[service.icon] || Users;

            return (
              <Card key={String(service.id || service.title)} className="gap-4">
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
                    <Icon color={palette.primary} size={22} />
                  </View>
                  <View className="flex-1">
                    <AppText weight="bold" className="text-lg">
                      {service.title}
                    </AppText>
                    <AppText className="text-sm leading-6 text-brand-subtext">{service.description}</AppText>
                  </View>
                </View>
                <View className="gap-2">
                  {service.features.map((feature) => (
                    <AppText key={feature} className="text-sm leading-6 text-brand-subtext">
                      • {feature}
                    </AppText>
                  ))}
                </View>
              </Card>
            );
          })}
        </View>
      )}

      <Card className="gap-4">
        <AppText weight="bold" className="text-xl">
          Request a service
        </AppText>
        <TextField label="Full name" value={form.name} onChangeText={(name) => setForm((prev) => ({ ...prev, name }))} />
        <TextField
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(email) => setForm((prev) => ({ ...prev, email }))}
        />
        <TextField
          label="Phone"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(phone) => setForm((prev) => ({ ...prev, phone }))}
        />
        <TextField
          label="Service needed"
          value={form.service}
          onChangeText={(service) => setForm((prev) => ({ ...prev, service }))}
        />
        <TextField
          label="Tell us about your needs"
          multiline
          value={form.message}
          onChangeText={(message) => setForm((prev) => ({ ...prev, message }))}
        />
        <Button onPress={handleSubmit}>Submit request</Button>
      </Card>
    </Screen>
  );
};
