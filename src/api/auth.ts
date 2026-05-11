import {
  getResponseStatus,
  normalizeAuthenticatedUser,
  normalizeUserType,
} from "@/lib/utils";
import type {
  ApiEnvelope,
  ApiSingleResponse,
  AuthenticatedUser,
} from "@/types/domain";
import { apiRequest, clearAuthSession, setAuthSession } from "./client";

const pickUserFromPayload = (payload?: Record<string, any>) =>
  (payload && typeof payload.id !== "undefined"
    ? (payload as AuthenticatedUser)
    : undefined) ||
  (payload?.user as AuthenticatedUser | undefined) ||
  (payload?.data as AuthenticatedUser | undefined);

const pickTokenValue = (
  payload: Record<string, any> | undefined,
  keys: string[],
) => {
  for (const key of keys) {
    const value = payload?.[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
};

export const loginUser = async (payload: {
  email: string;
  password: string;
}) => {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, any>>>(
      "auth/login",
      "POST",
      payload,
      false,
      { skipAuth: true },
    );

    const responseData =
      response?.data && typeof response.data === "object"
        ? (response.data as Record<string, any>)
        : response;
    const accessToken = pickTokenValue(responseData, [
      "access_token",
      "accessToken",
      "token",
    ]);
    const refreshToken = pickTokenValue(responseData, [
      "refresh_token",
      "refreshToken",
    ]);
    const csrfToken = pickTokenValue(responseData, [
      "csrf_token",
      "csrfToken",
    ]);
    const user = pickUserFromPayload(responseData);

    if (!accessToken || !user) {
      return {
        success: false,
        message: response.message || "Invalid login response from server.",
        status: getResponseStatus(response),
      };
    }

    await setAuthSession(accessToken, csrfToken, refreshToken);

    return {
      success: true,
      data: normalizeAuthenticatedUser(user),
      message: response.message || "Login successful",
      status: getResponseStatus(response),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to log in.",
      status: 500,
    };
  }
};

export const registerUser = async (payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  password: string;
}) => {
  try {
    const full_name =
      `${payload.firstName.trim()} ${payload.lastName.trim()}`.trim();
    const username = `${payload.firstName}.${payload.lastName}`
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "");

    const response = await apiRequest<ApiEnvelope<Record<string, any>>>(
      "auth/register",
      "POST",
      {
        username,
        email: payload.email.trim(),
        password: payload.password,
        full_name,
        phone: payload.phone.trim(),
        user_type: "user",
        address: "",
        date_of_birth: payload.dateOfBirth,
      },
      false,
      { skipAuth: true },
    );

    return {
      success: getResponseStatus(response) < 400,
      message:
        response.message || "Registration successful. Continue with sign in.",
      status: getResponseStatus(response),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to register.",
      status: 500,
    };
  }
};

export const getAuthMe = async (): Promise<
  ApiSingleResponse<AuthenticatedUser>
> => {
  try {
    const response = await apiRequest<
      ApiEnvelope<AuthenticatedUser | Record<string, any>>
    >("auth/me", "GET");
    const payload =
      response?.data && typeof response.data === "object"
        ? (response.data as Record<string, any>)
        : (response as Record<string, any>);
    const directUser =
      payload && typeof payload === "object"
        ? pickUserFromPayload(payload as Record<string, any>)
        : undefined;

    if (!directUser) {
      return {
        success: false,
        message: response.message || "No authenticated user found.",
        status: getResponseStatus(response),
      };
    }

    return {
      success: true,
      data: normalizeAuthenticatedUser(directUser),
      message: response.message || "Authenticated user retrieved",
      status: getResponseStatus(response),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unable to load your profile.",
      status: 500,
    };
  }
};

export const logoutUser = async () => {
  try {
    await apiRequest("auth/logout", "POST");
  } catch {
    // The local session should still be cleared even if the server logout fails.
  } finally {
    await clearAuthSession();
  }

  return {
    success: true,
    message: "Logged out",
    status: 200,
  };
};

export const getNormalizedUserType = (userType?: string) =>
  normalizeUserType(userType);
