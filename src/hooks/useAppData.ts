import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import {
  addToCart,
  getCartItems,
  getFarmServices,
  getProduct,
  getProducts,
  getStoredSession,
  getSupportConversation,
  getSupportMessages,
  getUserOrders,
  logoutUser,
  markSupportConversationRead,
  removeCartItem,
  sendSupportMessage,
  SOCKET_BASE_URL,
  updateCartItem,
} from "@/services/api";
import { mapConversationMessage } from "@/lib/utils";

export const queryKeys = {
  products: ["products"] as const,
  product: (productId: string | number) => ["products", String(productId)] as const,
  services: ["services"] as const,
  cart: ["cart"] as const,
  orders: ["orders"] as const,
  supportConversation: ["support-conversation"] as const,
  supportMessages: (page: number, perPage: number) =>
    ["support-messages", page, perPage] as const,
};

const isMissingConversationError = (message: string) =>
  /not found|no conversation|does not exist|404/i.test(message);

export const useProducts = () =>
  useQuery({
    queryKey: queryKeys.products,
    queryFn: async () => {
      const response = await getProducts();
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

export const useProduct = (productId?: string | number) =>
  useQuery({
    queryKey: queryKeys.product(productId || "unknown"),
    enabled: Boolean(productId),
    queryFn: async () => {
      const response = await getProduct(productId!);
      if (!response.success || !response.data) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

export const useFarmServices = () =>
  useQuery({
    queryKey: queryKeys.services,
    queryFn: async () => {
      const response = await getFarmServices();
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });

export const useCartQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.cart,
    enabled,
    queryFn: async () => {
      const response = await getCartItems();
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 30,
  });

export const useOrdersQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.orders,
    enabled,
    queryFn: async () => {
      const response = await getUserOrders();
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });

export const useSupportConversation = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.supportConversation,
    enabled,
    queryFn: async () => {
      const response = await getSupportConversation();
      if (!response.success) {
        if (isMissingConversationError(response.message)) return undefined;
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 20,
  });

export const useSupportMessages = (params: { page?: number; per_page?: number } = {}, enabled = true) =>
  useQuery({
    queryKey: queryKeys.supportMessages(params.page ?? 1, params.per_page ?? 50),
    enabled,
    queryFn: async () => {
      const response = await getSupportMessages(params);
      if (!response.success) {
        if (isMissingConversationError(response.message)) {
          return {
            data: [],
            meta: {
              page: params.page ?? 1,
              per_page: params.per_page ?? 50,
              total: 0,
              pages: 0,
            },
          };
        }
        throw new Error(response.message);
      }

      return {
        data: response.data.map((message) => mapConversationMessage(message, "Customer Support")),
        meta: response.meta,
      };
    },
    staleTime: 1000 * 15,
  });

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
};

export const useUpdateCartItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cartId, quantity }: { cartId: string; quantity: number }) =>
      updateCartItem(cartId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
};

export const useRemoveCartItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartId: number) => removeCartItem(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
};

export const useSendSupportMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => sendSupportMessage(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.supportConversation });
      queryClient.invalidateQueries({ queryKey: ["support-messages"] });
    },
  });
};

export const useMarkSupportConversationReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markSupportConversationRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.supportConversation });
      queryClient.invalidateQueries({ queryKey: ["support-messages"] });
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.cart });
      queryClient.removeQueries({ queryKey: queryKeys.orders });
      queryClient.removeQueries({ queryKey: queryKeys.supportConversation });
      queryClient.removeQueries({ queryKey: ["support-messages"] });
    },
  });
};

export const useSupportChatRealtime = ({
  enabled,
  conversationId,
}: {
  enabled: boolean;
  conversationId?: string;
}) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    let socket: Socket | null = null;
    let cancelled = false;

    const connect = async () => {
      const session = await getStoredSession();
      if (cancelled) return;

      socket = io(SOCKET_BASE_URL, {
        path: "/socket.io",
        transports: ["polling", "websocket"],
        withCredentials: true,
        auth: session.accessToken
          ? {
              token: session.accessToken,
              access_token: session.accessToken,
              bearer_token: `Bearer ${session.accessToken}`,
            }
          : undefined,
        query: session.accessToken ? { token: session.accessToken } : undefined,
      });

      const handleEvent = (payload?: Record<string, any>) => {
        const targetConversationId =
          payload?.conversation_id ||
          payload?.conversationId ||
          payload?.id ||
          payload?.conversation?.id;

        if (!targetConversationId || !conversationId || String(targetConversationId) === String(conversationId)) {
          queryClient.invalidateQueries({ queryKey: queryKeys.supportConversation });
          queryClient.invalidateQueries({ queryKey: ["support-messages"] });
        }
      };

      socket.on("connect", () => {
        if (conversationId) {
          socket?.emit("conversation:join", { conversation_id: conversationId });
        }
      });

      socket.on("conversation:new", handleEvent);
      socket.on("conversation:updated", handleEvent);
      socket.on("message:new", handleEvent);
      socket.on("conversation:read", handleEvent);
    };

    void connect();

    return () => {
      cancelled = true;

      if (socket) {
        if (conversationId) {
          socket.emit("conversation:leave", { conversation_id: conversationId });
        }
        socket.disconnect();
      }
    };
  }, [conversationId, enabled, queryClient]);
};
