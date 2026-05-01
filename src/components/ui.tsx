import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { LucideIcon } from "lucide-react-native";
import {
  Bell,
  LogIn,
  MessageCircle,
  Search,
  UserPlus,
} from "lucide-react-native";
import { cn } from "@/lib/utils";
import { fontFamilies, palette } from "@/theme";

type TextWeight = "regular" | "medium" | "semibold" | "bold" | "extrabold";

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

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  outline: "border border-brand-line bg-white",
  ghost: "bg-transparent",
  destructive: "bg-destructive",
};

const buttonTextClasses: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-primary",
  outline: "text-brand-ink",
  ghost: "text-primary",
  destructive: "text-white",
};

const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 py-2.5",
  md: "min-h-12 px-5 py-3",
  lg: "min-h-14 px-6 py-3.5",
};

export const Button = ({
  children,
  className,
  variant = "primary",
  size = "md",
  textClassName,
  disabled,
  ...props
}: React.ComponentProps<typeof Pressable> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  textClassName?: string;
}) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    className={cn(
      "items-center justify-center rounded-2xl",
      buttonVariantClasses[variant],
      buttonSizeClasses[size],
      disabled && "opacity-50",
      className,
    )}
    {...props}
  >
    {typeof children === "string" ? (
      <AppText
        weight="semibold"
        className={cn("text-base", buttonTextClasses[variant], textClassName)}
      >
        {children}
      </AppText>
    ) : (
      children
    )}
  </Pressable>
);

export const Screen = ({
  children,
  scroll = true,
  className,
  contentContainerClassName,
  header,
  headerClassName,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
  contentContainerClassName?: string;
  header?: React.ReactNode;
  headerClassName?: string;
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
          {header ? <View className={headerClassName}>{header}</View> : null}
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={cn("flex-1 bg-background px-5", className)}>
      {header ? <View className={headerClassName}>{header}</View> : null}
      {children}
    </SafeAreaView>
  );
};

const HeaderIconButton = ({
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

export const WelcomeHeader = ({
  title,
  subtitle = "Welcome back!",
  onSearchPress,
  onNotificationPress,
  notificationCount = 0,
  isAutenticated = false,
}: {
  title: string;
  subtitle?: string;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
  isAutenticated?: boolean;
}) => (
  <View className="flex-row items-center justify-between gap-4">
    <View className="flex-1">
      {isAutenticated ? (
        <View>
          <AppText className="text-sm text-brand-subtext">{subtitle}</AppText>
          <AppText weight="bold" className="mt-0.5 text-[30px] leading-9">
            {title}
          </AppText>
        </View>
      ) : null}
    </View>
    <View className="flex-row items-center gap-3">
      <HeaderIconButton
        icon={Search}
        accessibilityLabel="Search products"
        onPress={onSearchPress}
      />
      <HeaderIconButton
        icon={Bell}
        accessibilityLabel="Open notifications"
        hasNotification={notificationCount > 0}
        onPress={onNotificationPress}
      />
      <HeaderIconButton
        icon={MessageCircle}
        accessibilityLabel="Sign in"
        onPress={onSearchPress}
      />
    </View>
  </View>
);

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

export const LoadingState = ({ label = "Loading..." }: { label?: string }) => (
  <View className="items-center justify-center gap-4 py-10">
    <ActivityIndicator color={palette.primary} size="large" />
    <AppText className="text-sm text-brand-subtext">{label}</AppText>
  </View>
);

export const FullScreenLoader = ({
  label = "Loading...",
}: {
  label?: string;
}) => (
  <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
    <View className="items-center gap-5">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-secondary">
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
      <View className="items-center gap-2">
        <AppText weight="bold" className="text-2xl">
          Pomegrid Aqua
        </AppText>
        <AppText className="text-center text-sm text-brand-subtext">
          {label}
        </AppText>
      </View>
    </View>
  </SafeAreaView>
);

export const Divider = () => <View className="my-5 h-px bg-brand-line" />;

export const AuthPrompt = ({
  title = "Sign in to continue",
  description = "This part of the app uses your account and live data from the backend.",
}: {
  title?: string;
  description?: string;
}) => {
  const navigation = useNavigation<any>();

  return (
    <EmptyState
      icon={LogIn}
      title={title}
      description={description}
      action={
        <View className="mt-2 w-full gap-3">
          <Button onPress={() => navigation.navigate("Login")}>
            <View className="flex-row items-center gap-2">
              <LogIn color="#FFFFFF" size={18} />
              <AppText weight="semibold" className="text-white">
                Sign in
              </AppText>
            </View>
          </Button>
          <Button
            variant="outline"
            onPress={() => navigation.navigate("Register")}
          >
            <View className="flex-row items-center gap-2">
              <UserPlus color={palette.primary} size={18} />
              <AppText weight="semibold" className="text-primary">
                Create account
              </AppText>
            </View>
          </Button>
        </View>
      }
    />
  );
};
