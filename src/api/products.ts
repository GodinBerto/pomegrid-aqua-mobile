import {
  extractListData,
  extractSingleData,
  extractMessage,
  getResponseStatus,
} from "@/lib/utils";
import type { ApiEnvelope, ApiListResponse, ApiSingleResponse, Product } from "@/types/domain";
import { apiRequest } from "./client";

export const getProducts = async (): Promise<ApiListResponse<Product>> => {
  try {
    const response = await apiRequest<ApiEnvelope<Product[]> | Product[]>(
      "products/",
      "GET",
    );
    const data = extractListData<Product>(response, ["data"]);

    return {
      success: true,
      data,
      message: extractMessage(response, "Products loaded"),
      status: Array.isArray(response)
        ? 200
        : getResponseStatus(response as ApiEnvelope),
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Unable to fetch products.",
      status: 500,
    };
  }
};

export const getProduct = async (
  id: string | number,
): Promise<ApiSingleResponse<Product>> => {
  try {
    const response = await apiRequest<ApiEnvelope<Product>>(
      `products/${id}`,
      "GET",
    );
    const data = extractSingleData<Product>(response, ["data"]);

    return {
      success: true,
      data,
      message: response.message || "Product loaded",
      status: getResponseStatus(response),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to fetch this product.",
      status: 500,
    };
  }
};
