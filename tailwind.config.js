/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "#D7E3D4",
        input: "#D7E3D4",
        ring: "#1B5E20",
        background: "#F7FBF5",
        foreground: "#132315",
        primary: {
          DEFAULT: "#1B5E20",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F2FCE2",
          foreground: "#1B5E20",
        },
        muted: {
          DEFAULT: "#EEF5EA",
          foreground: "#61705F",
        },
        accent: {
          DEFAULT: "#E3F0D6",
          foreground: "#1B5E20",
        },
        destructive: {
          DEFAULT: "#B42318",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#132315",
        },
        shopGreen: {
          light: "#F2FCE2",
          DEFAULT: "#1B5E20",
          dark: "#0D3F10",
        },
        shopBlack: {
          DEFAULT: "#000000",
          muted: "#333333",
        },
        brand: {
          canvas: "#F7FBF5",
          surface: "#FFFFFF",
          ink: "#132315",
          subtext: "#61705F",
          line: "#D7E3D4",
          success: "#0E7A3E",
          warning: "#B7791F",
          info: "#245C73",
        },
      },
      boxShadow: {
        soft: "0 10px 28px rgba(27, 94, 32, 0.10)",
      },
    },
  },
  plugins: [],
};
