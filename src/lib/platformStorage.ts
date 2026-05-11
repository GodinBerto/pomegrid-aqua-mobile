import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type { StateStorage } from "zustand/middleware";

const isWebRuntime =
  Platform.OS === "web" &&
  typeof window !== "undefined" &&
  typeof window.localStorage !== "undefined";

export const localAppStorage: StateStorage = isWebRuntime
  ? window.localStorage
  : AsyncStorage;

export const isBrowserCookieRuntime =
  Platform.OS === "web" && typeof document !== "undefined";
