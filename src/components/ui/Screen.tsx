import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cn } from "@/lib/utils";
import { AppPageHeader } from "./header/AppPageHeader";

export const Screen = ({
  children,
  scroll = true,
  className,
  contentContainerClassName,
  header,
  headerClassName,
  showAppHeader = true,
  appHeaderTitle,
  appHeaderSubtitle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
  contentContainerClassName?: string;
  header?: React.ReactNode;
  headerClassName?: string;
  showAppHeader?: boolean;
  appHeaderTitle?: string;
  appHeaderSubtitle?: string;
}) => {
  if (scroll) {
    return (
      <SafeAreaView className={cn("flex-1 bg-background", className)}>
        <ScrollView
          className="flex-1"
          contentContainerClassName={cn(
            "px-5 pb-10",
            contentContainerClassName,
          )}
          showsVerticalScrollIndicator={false}
        >
          {showAppHeader ? (
            <AppPageHeader
              title={appHeaderTitle}
              subtitle={appHeaderSubtitle}
            />
          ) : null}
          {header ? <View className={headerClassName}>{header}</View> : null}
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={cn("flex-1 bg-background px-5", className)}>
      {showAppHeader ? (
        <AppPageHeader title={appHeaderTitle} subtitle={appHeaderSubtitle} />
      ) : null}
      {header ? <View className={headerClassName}>{header}</View> : null}
      {children}
    </SafeAreaView>
  );
};
