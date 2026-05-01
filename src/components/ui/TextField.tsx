import { TextInput, View } from "react-native";
import { cn } from "@/lib/utils";
import { fontFamilies, palette } from "@/theme";
import { AppText } from "./AppText";

export const TextField = ({
  label,
  error,
  multiline,
  className,
  inputClassName,
  ...props
}: React.ComponentProps<typeof TextInput> & {
  label?: string;
  error?: string;
  inputClassName?: string;
}) => (
  <View className={cn("gap-2", className)}>
    {label ? (
      <AppText weight="semibold" className="text-sm text-brand-ink">
        {label}
      </AppText>
    ) : null}
    <TextInput
      placeholderTextColor={palette.subtext}
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      style={{ fontFamily: fontFamilies.medium }}
      className={cn(
        "rounded-2xl border border-brand-line bg-white px-4 py-3 text-base text-brand-ink",
        multiline && "min-h-28",
        inputClassName,
      )}
      {...props}
    />
    {error ? (
      <AppText className="text-sm text-destructive">{error}</AppText>
    ) : null}
  </View>
);
