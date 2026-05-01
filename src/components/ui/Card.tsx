import { View } from "react-native";
import { cn } from "@/lib/utils";

export const Card = ({
  children,
  className,
}: React.ComponentProps<typeof View>) => (
  <View
    className={cn(
      "rounded-[24px] border border-brand-line bg-brand-surface p-5 shadow-soft",
      className,
    )}
  >
    {children}
  </View>
);
