import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import {
  getStoredSession,
  getSupportConversation,
  getSupportMessages,
  markSupportConversationRead,
  sendSupportMessage,
  SOCKET_BASE_URL,
} from "@/api";
import { mapConversationMessage } from "@/lib/utils";
import { queryKeys } from "./keys";

const isMissingConversationError = (message: string) =>
  /not found|no conversation|does not exist|404/i.test(message);

export const useSupportConversation = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.support.conversation,
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

export const useSupportMessages = (
  params: { page?: number; per_page?: number } = {},
  enabled = true,
) =>
  useQuery({
    queryKey: queryKeys.support.messagePage(
      params.page ?? 1,
      params.per_page ?? 50,
    ),
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
        data: response.data.map((message) =>
          mapConversationMessage(message, "Customer Support"),
        ),
        meta: response.meta,
      };
    },
    staleTime: 1000 * 15,
  });

export const useSendSupportMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => sendSupportMessage(content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.support.conversation,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.support.messages });
    },
  });
};

export const useMarkSupportConversationReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markSupportConversationRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.support.conversation,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.support.messages });
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
        query: session.accessToken
          ? { token: session.accessToken }
          : undefined,
      });

      const handleEvent = (payload?: Record<string, any>) => {
        const targetConversationId =
          payload?.conversation_id ||
          payload?.conversationId ||
          payload?.id ||
          payload?.conversation?.id;

        if (
          !targetConversationId ||
          !conversationId ||
          String(targetConversationId) === String(conversationId)
        ) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.support.conversation,
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.support.messages,
          });
        }
      };

      socket.on("connect", () => {
        if (conversationId) {
          socket?.emit("conversation:join", {
            conversation_id: conversationId,
          });
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
          socket.emit("conversation:leave", {
            conversation_id: conversationId,
          });
        }
        socket.disconnect();
      }
    };
  }, [conversationId, enabled, queryClient]);
};
