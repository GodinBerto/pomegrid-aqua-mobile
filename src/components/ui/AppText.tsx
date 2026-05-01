import { Text } from "react-native";
import { cn } from "@/lib/utils";
import { fontFamilies } from "@/theme";

export type TextWeight =
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold";

const fontFamilyMap: Record<TextWeight, string> = {
  regular: fontFamilies.regular,
  medium: fontFamilies.medium,
  semibold: fontFamilies.semibold,
  bold: fontFamilies.bold,
  extrabold: fontFamilies.extrabold,
};

export const AppText = ({
  children,
  className,
  weight = "regular",
  style,
  ...props
}: React.ComponentProps<typeof Text> & { weight?: TextWeight }) => (
  <Text
    {...props}
    className={cn("text-brand-ink", className)}
    style={[{ fontFamily: fontFamilyMap[weight] }, style]}
  >
    {children}
  </Text>
);
