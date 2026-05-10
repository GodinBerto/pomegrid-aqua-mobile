import { useEffect } from "react";
import { FullScreenLoader } from "@/components/ui";
import { clearAuthSession, hasStoredSession } from "@/api";
import {
  clearAuthenticatedUserState,
  fetchCurrentUser,
  syncAuthenticatedUser,
} from "@/query";
import { useAuthStore } from "@/store/authStore";

export const AuthBootstrap = ({ children }: { children: React.ReactNode }) => {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const setBootstrapping = useAuthStore((state) => state.setBootstrapping);

  useEffect(() => {
    if (!hasHydrated) return;

    let cancelled = false;

    const bootstrapSession = async () => {
      setBootstrapping(true);

      const hasSession = await hasStoredSession();
      if (!hasSession) {
        if (!cancelled) {
          clearAuthenticatedUserState();
        }
        return;
      }

      try {
        const user = await fetchCurrentUser();

        if (cancelled) return;

        syncAuthenticatedUser(user);
      } catch {
        await clearAuthSession();
      }
    };

    void bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, setBootstrapping]);

  if (!hasHydrated || isBootstrapping) {
    return <FullScreenLoader label="Syncing your profile and cache..." />;
  }

  return children;
};
