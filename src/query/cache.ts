import type { AuthenticatedUser } from "@/types/domain";
import { queryClient } from "./client";
import { queryKeys } from "./keys";

export const setCurrentUserCache = (user: AuthenticatedUser) => {
  queryClient.setQueryData(queryKeys.auth.currentUser, user);
};

export const getCurrentUserCache = () =>
  queryClient.getQueryData<AuthenticatedUser>(queryKeys.auth.currentUser);

export const clearAuthenticatedQueryCache = () => {
  queryClient.removeQueries({ queryKey: queryKeys.auth.currentUser });
  queryClient.removeQueries({ queryKey: queryKeys.commerce.cart });
  queryClient.removeQueries({ queryKey: queryKeys.commerce.orders });
  queryClient.removeQueries({ queryKey: queryKeys.support.conversation });
  queryClient.removeQueries({ queryKey: queryKeys.support.messages });
};
