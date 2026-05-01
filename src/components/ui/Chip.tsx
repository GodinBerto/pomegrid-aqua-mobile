import { Pressable } from "react-native";
import { cn } from "@/lib/utils";
import { AppText } from "./AppText";

export const Chip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className={cn(
      "mr-3 rounded-full border px-4 py-2",
      active ? "border-primary bg-primary" : "border-brand-line bg-white",
    )}
  >
    <AppText
      weight="semibold"
      className={cn("text-sm", active ? "text-white" : "text-brand-subtext")}
    >
      {label}
    </AppText>
  </Pressable>
);
