import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAuthMe,
  loginUser,
  logoutUser,
  registerUser,
} from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthenticatedUser } from "@/types/domain";
import { clearAuthenticatedQueryCache, setCurrentUserCache } from "./cache";
import { queryKeys } from "./keys";

export const fetchCurrentUser = async (): Promise<AuthenticatedUser> => {
  const response = await getAuthMe();

  if (!response.success || !response.data) {
    throw new Error(response.message || "Unable to load your profile.");
  }

  return response.data;
};

export const syncAuthenticatedUser = (user: AuthenticatedUser) => {
  useAuthStore.getState().setUser(user);
  setCurrentUserCache(user);
};

export const clearAuthenticatedUserState = () => {
  useAuthStore.getState().signOutLocal();
  clearAuthenticatedQueryCache();
};

export const useCurrentUserQuery = (enabled = true) => {
  const storedUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const query = useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: fetchCurrentUser,
    enabled,
    initialData: storedUser ?? undefined,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
};

export const useSessionUser = () => {
  const storedUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const currentUserQuery = useCurrentUserQuery(
    isAuthenticated && !isBootstrapping,
  );

  const user = currentUserQuery.data ?? storedUser ?? null;

  return {
    user,
    isAuthenticated: isAuthenticated && Boolean(user),
    isBootstrapping,
    currentUserQuery,
  };
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      if (!response.success || !response.data) return;

      syncAuthenticatedUser(response.data);

      void Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.commerce.cart }),
        queryClient.invalidateQueries({ queryKey: queryKeys.commerce.orders }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.support.conversation,
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.support.messages }),
      ]);
    },
  });
};

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: registerUser,
  });

export const useLogoutMutation = () =>
  useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      clearAuthenticatedQueryCache();
    },
  });
