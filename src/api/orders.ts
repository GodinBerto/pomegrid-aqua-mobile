import { extractListData, extractSingleData, getResponseStatus } from "@/lib/utils";
import type {
  ApiEnvelope,
  ApiListResponse,
  ApiSingleResponse,
  CreateOrderPayload,
  Order,
} from "@/types/domain";
import { apiRequest } from "./client";

const normalizeOptionalText = (value?: string | null) => {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
};

export const getUserOrders = async (): Promise<ApiListResponse<Order>> => {
  try {
    const response = await apiRequest<ApiEnvelope<Order[]>>(
      "orders/get-user-orders",
      "GET",
    );

    return {
      success: true,
      data: extractListData<Order>(response, ["data"]),
      message: response.message || "Orders loaded",
      status: getResponseStatus(response),
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Unable to fetch your orders.",
      status: 500,
    };
  }
};

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<ApiSingleResponse<Order>> => {
  try {
    const response = await apiRequest<ApiEnvelope<Order>>(
      "orders/create-order",
      "POST",
      {
        items: payload.items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
        })),
        ...(normalizeOptionalText(payload.payment_method)
          ? { payment_method: normalizeOptionalText(payload.payment_method) }
          : {}),
        ...(normalizeOptionalText(payload.shipping_address)
          ? {
              shipping_address: normalizeOptionalText(payload.shipping_address),
            }
          : {}),
        ...(normalizeOptionalText(payload.notes)
          ? { notes: normalizeOptionalText(payload.notes) }
          : {}),
      },
    );

    return {
      success: true,
      data: extractSingleData<Order>(response, ["data"]),
      message: response.message || "Order created",
      status: getResponseStatus(response),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unable to create this order.",
      status: 500,
    };
  }
};
