import { Pressable, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { palette } from "@/theme";

export const HeaderIconButton = ({
  icon: Icon,
  accessibilityLabel,
  hasNotification,
  ...props
}: React.ComponentProps<typeof Pressable> & {
  icon: LucideIcon;
  accessibilityLabel: string;
  hasNotification?: boolean;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    className="relative h-11 w-11 items-center justify-center rounded-full border border-brand-line bg-white"
    {...props}
  >
    <Icon color={palette.ink} size={20} />
    {hasNotification ? (
      <View className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-primary" />
    ) : null}
  </Pressable>
);
