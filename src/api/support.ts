import {
  buildQueryString,
  extractListData,
  extractMeta,
  extractSingleData,
  getResponseStatus,
} from "@/lib/utils";
import type {
  ApiEnvelope,
  ApiListResponse,
  ApiSingleResponse,
  ConversationRecord,
  MessageRecord,
} from "@/types/domain";
import { apiRequest } from "./client";

export const getSupportConversation = async (): Promise<
  ApiSingleResponse<ConversationRecord>
> => {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, any>>>(
      "user/messages/support/conversation",
      "GET",
    );

    return {
      success: true,
      data: extractSingleData<ConversationRecord>(response, [
        "conversation",
        "data",
      ]),
      message: response.message || "Conversation loaded",
      status: getResponseStatus(response),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to fetch your support conversation.",
      status: 500,
    };
  }
};

export const getSupportMessages = async (
  params: { page?: number; per_page?: number } = {},
): Promise<ApiListResponse<MessageRecord>> => {
  try {
    const query = buildQueryString(params as Record<string, unknown>);
    const response = await apiRequest<ApiEnvelope<Record<string, any>>>(
      `user/messages/support/conversation/messages${query}`,
      "GET",
    );
    const data = extractListData<MessageRecord>(response, ["messages", "data"]);

    return {
      success: true,
      data,
      meta: extractMeta(response as Record<string, any>, {
        page: params.page ?? 1,
        per_page: params.per_page ?? (data.length || 20),
        total: data.length,
        pages: 1,
      }),
      message: response.message || "Messages loaded",
      status: getResponseStatus(response),
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message:
        error instanceof Error
          ? error.message
          : "Unable to fetch support messages.",
      status: 500,
    };
  }
};

export const sendSupportMessage = async (
  content: string,
): Promise<ApiSingleResponse<MessageRecord>> => {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, any>>>(
      "user/messages/support/conversation/messages",
      "POST",
      { content },
    );

    return {
      success: true,
      data: extractSingleData<MessageRecord>(response, ["message", "data"]),
      message: response.message || "Message sent",
      status: getResponseStatus(response),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unable to send your message.",
      status: 500,
    };
  }
};

export const markSupportConversationRead = async () => {
  try {
    const response = await apiRequest<ApiEnvelope>(
      "user/messages/support/conversation/read",
      "POST",
    );

    return {
      success: true,
      message: response.message || "Conversation marked as read",
      status: getResponseStatus(response),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update conversation status.",
      status: 500,
    };
  }
};
