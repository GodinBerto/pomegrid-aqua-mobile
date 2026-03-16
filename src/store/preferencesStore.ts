import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type PreferencesState = {
  language: string;
  timezone: string;
  currency: string;
  notifications: {
    email: boolean;
    orders: boolean;
    promotions: boolean;
    sms: boolean;
  };
  setLanguage: (language: string) => void;
  setTimezone: (timezone: string) => void;
  setCurrency: (currency: string) => void;
  updateNotifications: (updates: Partial<PreferencesState["notifications"]>) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      language: "English",
      timezone: "America/New_York",
      currency: "USD",
      notifications: {
        email: true,
        orders: true,
        promotions: false,
        sms: false,
      },
      setLanguage: (language) => set({ language }),
      setTimezone: (timezone) => set({ timezone }),
      setCurrency: (currency) => set({ currency }),
      updateNotifications: (updates) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            ...updates,
          },
        })),
    }),
    {
      name: "pomegrid-preferences-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
