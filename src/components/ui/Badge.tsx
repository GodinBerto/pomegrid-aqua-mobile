import { View } from "react-native";
import { cn } from "@/lib/utils";
import { AppText } from "./AppText";

export const Badge = ({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "success" | "warning" | "danger";
}) => {
  const toneClasses: Record<typeof tone, string> = {
    default: "bg-secondary text-primary",
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800",
  };

  return (
    <View className={cn("rounded-full px-3 py-1.5", toneClasses[tone])}>
      <AppText weight="semibold" className="text-xs">
        {label}
      </AppText>
    </View>
  );
};
