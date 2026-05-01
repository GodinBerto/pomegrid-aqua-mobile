import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette } from "@/theme";
import { AppText } from "./AppText";

export const FullScreenLoader = ({
  label = "Loading...",
}: {
  label?: string;
}) => (
  <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
    <View className="items-center gap-5">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-secondary">
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
      <View className="items-center gap-2">
        <AppText weight="bold" className="text-2xl">
          Pomegrid Aqua
        </AppText>
        <AppText className="text-center text-sm text-brand-subtext">
          {label}
        </AppText>
      </View>
    </View>
  </SafeAreaView>
);
