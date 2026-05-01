import { View } from "react-native";
import { AppText } from "./AppText";

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <View className="mb-5 flex-row items-end justify-between gap-4">
    <View className="flex-1">
      {eyebrow ? (
        <AppText
          weight="semibold"
          className="mb-1 text-xs uppercase tracking-[1.4px] text-primary"
        >
          {eyebrow}
        </AppText>
      ) : null}
      <AppText weight="bold" className="text-[28px] leading-8">
        {title}
      </AppText>
      {description ? (
        <AppText className="mt-2 text-sm leading-6 text-brand-subtext">
          {description}
        </AppText>
      ) : null}
    </View>
    {action}
  </View>
);
