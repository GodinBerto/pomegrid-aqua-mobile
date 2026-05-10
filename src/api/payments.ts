import { extractSingleData, getResponseStatus } from "@/lib/utils";
import type {
  ApiEnvelope,
  ApiSingleResponse,
  InitializePaymentPayload,
  PaymentRecord,
} from "@/types/domain";
import { apiRequest } from "./client";

export const initializePayment = async (
  payload: InitializePaymentPayload,
): Promise<ApiSingleResponse<PaymentRecord>> => {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, any>>>(
      "payments/initialize",
      "POST",
      payload,
      false,
      { skipRefresh: true },
    );

    return {
      success: true,
      data: extractSingleData<PaymentRecord>(response, ["payment", "data"]),
      message: response.message || "Payment initialized",
      status: getResponseStatus(response),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unable to start payment.",
      status: 500,
    };
  }
};

export const verifyPayment = async (
  reference: string,
): Promise<ApiSingleResponse<PaymentRecord>> => {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, any>>>(
      `payments/verify/${reference}`,
      "GET",
      undefined,
      false,
      { skipRefresh: true },
    );

    return {
      success: true,
      data: extractSingleData<PaymentRecord>(response, ["payment", "data"]),
      message: response.message || "Payment verified",
      status: getResponseStatus(response),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unable to verify payment.",
      status: 500,
    };
  }
};
