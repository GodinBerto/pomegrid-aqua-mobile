import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { localAppStorage } from "@/lib/platformStorage";
import type { AuthenticatedUser } from "@/types/domain";

type AuthState = {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  hasHydrated: boolean;
  setUser: (user: AuthenticatedUser) => void;
  signOutLocal: () => void;
  setBootstrapping: (isBootstrapping: boolean) => void;
  setHydrated: (hasHydrated: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isBootstrapping: true,
      hasHydrated: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
          isBootstrapping: false,
        }),
      signOutLocal: () =>
        set({
          user: null,
          isAuthenticated: false,
          isBootstrapping: false,
        }),
      setBootstrapping: (isBootstrapping) => set({ isBootstrapping }),
      setHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "pomegrid-auth-store",
      storage: createJSONStorage(() => localAppStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
