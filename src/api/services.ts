import {
  extractListData,
  extractMessage,
  getResponseStatus,
} from "@/lib/utils";
import type { ApiEnvelope, ApiListResponse, FarmService } from "@/types/domain";
import { apiRequest } from "./client";

export const getFarmServices = async (): Promise<
  ApiListResponse<FarmService>
> => {
  try {
    const response = await apiRequest<
      ApiEnvelope<FarmService[]> | FarmService[]
    >("services/", "GET");
    const data = extractListData<FarmService>(response, ["data", "services"]);

    return {
      success: true,
      data,
      message: extractMessage(response, "Services loaded"),
      status: Array.isArray(response)
        ? 200
        : getResponseStatus(response as ApiEnvelope),
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Unable to fetch services.",
      status: 500,
    };
  }
};
