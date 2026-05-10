import {
  extractListData,
  extractSingleData,
  getResponseStatus,
} from "@/lib/utils";
import type {
  AddToCartPayload,
  ApiEnvelope,
  ApiListResponse,
  ApiSingleResponse,
  CartItem,
} from "@/types/domain";
import { apiRequest } from "./client";

export const getCartItems = async (): Promise<ApiListResponse<CartItem>> => {
  try {
    const response = await apiRequest<ApiEnvelope<CartItem[]>>("carts/", "GET");

    return {
      success: true,
      data: extractListData<CartItem>(response, ["data"]),
      message: response.message || "Cart loaded",
      status: getResponseStatus(response),
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Unable to fetch your cart.",
      status: 500,
    };
  }
};

export const addToCart = async (payload: AddToCartPayload) => {
  try {
    const response = await apiRequest<ApiEnvelope>("carts/", "POST", payload);

    return {
      success: true,
      message: response.message || "Added to cart",
      status: getResponseStatus(response),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to add this item to your cart.",
      status: 500,
    };
  }
};

export const updateCartItem = async (
  cartId: string,
  quantity: number,
): Promise<ApiSingleResponse<CartItem>> => {
  try {
    const response = await apiRequest<ApiEnvelope<CartItem>>(
      `carts/${cartId}`,
      "PUT",
      { quantity },
    );

    return {
      success: true,
      data: extractSingleData<CartItem>(response, ["data"]),
      message: response.message || "Cart updated",
      status: getResponseStatus(response),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update this cart item.",
      status: 500,
    };
  }
};

export const removeCartItem = async (cartId: number) => {
  try {
    const response = await apiRequest<ApiEnvelope>(`carts/${cartId}`, "DELETE");

    return {
      success: true,
      message: response.message || "Removed from cart",
      status: getResponseStatus(response),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unable to remove this item.",
      status: 500,
    };
  }
};
