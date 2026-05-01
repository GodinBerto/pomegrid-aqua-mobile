import { ActivityIndicator, View } from "react-native";
import { palette } from "@/theme";
import { AppText } from "./AppText";

export const LoadingState = ({ label = "Loading..." }: { label?: string }) => (
  <View className="items-center justify-center gap-4 py-10">
    <ActivityIndicator color={palette.primary} size="large" />
    <AppText className="text-sm text-brand-subtext">{label}</AppText>
  </View>
);
