import { DefaultTheme, type Theme } from "@react-navigation/native";

export const palette = {
  primary: "#1B5E20",
  primaryDark: "#0D3F10",
  primaryLight: "#F2FCE2",
  canvas: "#F7FBF5",
  surface: "#FFFFFF",
  ink: "#132315",
  subtext: "#61705F",
  border: "#D7E3D4",
  muted: "#EEF5EA",
  accent: "#E3F0D6",
  black: "#000000",
  blackMuted: "#333333",
  danger: "#B42318",
  success: "#0E7A3E",
  warning: "#B7791F",
  info: "#245C73",
};

export const fontFamilies = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
};

export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.primary,
    background: palette.canvas,
    card: palette.surface,
    text: palette.ink,
    border: palette.border,
    notification: palette.primary,
  },
};
