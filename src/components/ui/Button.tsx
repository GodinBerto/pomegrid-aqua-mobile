import { Pressable } from "react-native";
import { cn } from "@/lib/utils";
import { AppText } from "./AppText";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

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
