import { useEffect } from "react";
import { FullScreenLoader } from "@/components/ui";
import { clearAuthSession, getAuthMe, hasStoredSession } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export const AuthBootstrap = ({ children }: { children: React.ReactNode }) => {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const setBootstrapping = useAuthStore((state) => state.setBootstrapping);
  const setUser = useAuthStore((state) => state.setUser);
  const signOutLocal = useAuthStore((state) => state.signOutLocal);

  useEffect(() => {
    if (!hasHydrated) return;

    let cancelled = false;

    const bootstrapSession = async () => {
      setBootstrapping(true);

      const hasSession = await hasStoredSession();
      if (!hasSession) {
        if (!cancelled) {
          signOutLocal();
        }
        return;
      }

      const response = await getAuthMe();

      if (cancelled) return;

      if (response.success && response.data) {
        setUser(response.data);
        return;
      }

      await clearAuthSession();
      signOutLocal();
    };

    void bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, setBootstrapping, setUser, signOutLocal]);

  if (!hasHydrated || isBootstrapping) {
    return <FullScreenLoader label="Syncing your profile and cache..." />;
  }

  return children;
};
