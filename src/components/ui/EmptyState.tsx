import { View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { palette } from "@/theme";
import { AppText } from "./AppText";
import { Card } from "./Card";

export const EmptyState = ({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
}) => (
  <Card className="items-center gap-3 py-10">
    {Icon ? (
      <View className="rounded-full bg-secondary p-4">
        <Icon color={palette.primary} size={28} />
      </View>
    ) : null}
    <AppText weight="bold" className="text-center text-xl">
      {title}
    </AppText>
    <AppText className="max-w-[280px] text-center text-sm leading-6 text-brand-subtext">
      {description}
    </AppText>
    {action}
  </Card>
);
