import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useAuthStore } from "@/store/authStore";
import {
  buildQueryString,
  extractListData,
  extractMessage,
  extractMeta,
  extractSingleData,
  getResponseStatus,
  normalizeAuthenticatedUser,
  normalizeUserType,
} from "@/lib/utils";
import type {
  AddToCartPayload,
  ApiEnvelope,
  ApiListResponse,
  ApiSingleResponse,
  AuthenticatedUser,
  CartItem,
  ConversationRecord,
  CreateOrderPayload,
  FarmService,
  InitializePaymentPayload,
  MessageRecord,
  Order,
  PaymentRecord,
  Product,
  SessionTokens,
} from "@/types/domain";

const ACCESS_TOKEN_STORAGE_KEY = "access_token";
const REFRESH_TOKEN_STORAGE_KEY = "refresh_token";
const CSRF_TOKEN_STORAGE_KEY = "csrf_token";
const REFRESH_ENDPOINT = "auth/refresh";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiRequestOptions = {
  headers?: HeadersInit;
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

let inMemorySession: SessionTokens | null = null;
let activeRefreshRequest: Promise<boolean> | null = null;
let refreshFailed = false;

const normalizeEndpoint = (endpoint: string) => endpoint.replace(/^\/+/, "");
const ensureTrailingSlash = (value: string) =>
  value.endsWith("/") ? value : `${value}/`;
const stripWrappingQuotes = (value?: string) =>
  value?.trim().replace(/^['"]|['"]$/g, "");
const isLoopbackHost = (value: string) =>
  ["localhost", "127.0.0.1", "0.0.0.0"].includes(value);

const parseHostname = (value?: string | null) => {
  if (!value) return undefined;

  try {
    const normalizedValue = value.includes("://") ? value : `http://${value}`;
    return new URL(normalizedValue).hostname;
  } catch {
    return undefined;
  }
};

const resolveExpoDevHost = () => {
  const hostCandidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.linkingUri,
    Constants.experienceUrl,
  ];

  for (const candidate of hostCandidates) {
    const hostname = parseHostname(candidate);
    if (hostname && !isLoopbackHost(hostname)) {
      return hostname;
    }
  }

  return undefined;
};

const remapLoopbackUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    if (!isLoopbackHost(parsed.hostname) || Platform.OS === "web") return value;

    const expoDevHost = resolveExpoDevHost();
    if (expoDevHost) {
      parsed.hostname = expoDevHost;
      return parsed.toString();
    }

    if (Platform.OS === "android") {
      parsed.hostname = "10.0.2.2";
      return parsed.toString();
    }

    return value;
  } catch {
    return value;
  }
};

const fallbackApiBaseUrl = () =>
  Platform.OS === "android"
    ? "http://10.0.2.2:8000/api/v1/"
    : "http://127.0.0.1:8000/api/v1/";

const resolveApiBaseUrl = () =>
  ensureTrailingSlash(
    remapLoopbackUrl(
      stripWrappingQuotes(process.env.EXPO_PUBLIC_API_URL) ||
        fallbackApiBaseUrl(),
    ),
  );

const resolveSocketBaseUrl = () => {
  const explicitSocketUrl = stripWrappingQuotes(
    process.env.EXPO_PUBLIC_SOCKET_URL,
  );
  if (explicitSocketUrl)
    return remapLoopbackUrl(explicitSocketUrl).replace(/\/+$/, "");

  try {
    return new URL(resolveApiBaseUrl()).origin;
  } catch {
    return remapLoopbackUrl(fallbackApiBaseUrl()).replace(/\/api\/v1\/?$/, "");
  }
};

export const API_BASE_URL = resolveApiBaseUrl();
export const SOCKET_BASE_URL = resolveSocketBaseUrl();

export const buildApiUrl = (endpoint: string) =>
  `${API_BASE_URL}${normalizeEndpoint(endpoint)}`;

const readPersistedSession = async (): Promise<SessionTokens> => {
  const entries = await AsyncStorage.multiGet([
    ACCESS_TOKEN_STORAGE_KEY,
    REFRESH_TOKEN_STORAGE_KEY,
    CSRF_TOKEN_STORAGE_KEY,
  ]);
  const lookup = Object.fromEntries(entries) as Record<string, string | null>;

  return {
    accessToken: lookup[ACCESS_TOKEN_STORAGE_KEY] || undefined,
    refreshToken: lookup[REFRESH_TOKEN_STORAGE_KEY] || undefined,
    csrfToken: lookup[CSRF_TOKEN_STORAGE_KEY] || undefined,
  };
};

export const getStoredSession = async () => {
  if (inMemorySession) return inMemorySession;
  inMemorySession = await readPersistedSession();
  return inMemorySession;
};

export const hasStoredSession = async () => {
  const session = await getStoredSession();
  return Boolean(
    session.accessToken || session.refreshToken || session.csrfToken,
  );
};

export const setAuthSession = async (
  accessToken: string,
  csrfToken?: string,
  refreshToken?: string,
) => {
  inMemorySession = {
    accessToken,
    csrfToken,
    refreshToken,
  };
  refreshFailed = false;

  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_STORAGE_KEY, accessToken],
    [REFRESH_TOKEN_STORAGE_KEY, refreshToken || ""],
    [CSRF_TOKEN_STORAGE_KEY, csrfToken || ""],
  ]);
};

export const clearAuthSession = async () => {
  inMemorySession = {
    accessToken: undefined,
    refreshToken: undefined,
    csrfToken: undefined,
  };
  refreshFailed = false;
  await AsyncStorage.multiRemove([
    ACCESS_TOKEN_STORAGE_KEY,
    REFRESH_TOKEN_STORAGE_KEY,
    CSRF_TOKEN_STORAGE_KEY,
  ]);
  useAuthStore.getState().signOutLocal();
};

const safeParseJson = async (response: Response) => {
  try {
    return (await response.json()) as Record<string, any>;
  } catch {
    return null;
  }
};

const parseResponse = async <T>(response: Response) => {
  if (response.status === 204) return {} as T;

  const text = await response.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
};

const shouldAttemptRefresh = async (
  statusCode: number,
  payload: Record<string, any> | null,
) => {
  if (![401, 403, 422].includes(statusCode)) return false;

  const session = await getStoredSession();
  if (
    !session.accessToken &&
    !session.refreshToken &&
    !useAuthStore.getState().isAuthenticated
  ) {
    return false;
  }

  if (statusCode === 401 || statusCode === 403) return true;

  const message = extractMessage(payload, "").toLowerCase();
  return ["token", "authorization", "jwt", "expired", "subject"].some((part) =>
    message.includes(part),
  );
};

const buildHeaders = async (
  endpoint: string,
  isFormData: boolean,
  options: ApiRequestOptions,
) => {
  const headers = new Headers(options.headers);
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  const session = await getStoredSession();

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (
    !options.skipAuth &&
    normalizedEndpoint !== REFRESH_ENDPOINT &&
    session.accessToken
  ) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  if (
    normalizedEndpoint === REFRESH_ENDPOINT &&
    session.csrfToken &&
    !headers.has("X-CSRF-TOKEN")
  ) {
    headers.set("X-CSRF-TOKEN", session.csrfToken);
  }

  return headers;
};

const performRequest = async (
  endpoint: string,
  method: HttpMethod,
  body: unknown,
  isFormData: boolean,
  options: ApiRequestOptions,
) => {
  const requestUrl = buildApiUrl(endpoint);

  try {
    return await fetch(requestUrl, {
      method,
      headers: await buildHeaders(endpoint, isFormData, options),
      credentials: "include",
      body: body
        ? isFormData
          ? (body as FormData)
          : JSON.stringify(body)
        : undefined,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Failed to reach API (${requestUrl}). Check that your backend host is reachable from the device or emulator.`,
      );
    }

    throw error;
  }
};

const extractRefreshPayload = (payload: Record<string, any> | null) => {
  const nestedData =
    payload?.data && typeof payload.data === "object" ? payload.data : payload;

  return {
    accessToken: nestedData?.access_token as string | undefined,
    refreshToken: nestedData?.refresh_token as string | undefined,
    csrfToken: nestedData?.csrf_token as string | undefined,
  };
};

const refreshAccessToken = async () => {
  if (activeRefreshRequest) return activeRefreshRequest;

  activeRefreshRequest = (async () => {
    try {
      const session = await getStoredSession();
      if (!session.refreshToken) {
        await clearAuthSession();
        return false;
      }

      const refreshResponse = await performRequest(
        REFRESH_ENDPOINT,
        "POST",
        { refresh_token: session.refreshToken },
        false,
        { skipAuth: true, skipRefresh: true },
      );

      const refreshPayload = await safeParseJson(refreshResponse);
      const refreshData = extractRefreshPayload(refreshPayload);

      if (!refreshResponse.ok || !refreshData.accessToken) {
        await clearAuthSession();
        refreshFailed = true;
        return false;
      }

      await setAuthSession(
        refreshData.accessToken,
        refreshData.csrfToken,
        refreshData.refreshToken,
      );
      return true;
    } catch {
      refreshFailed = true;
      await clearAuthSession();
      return false;
    } finally {
      activeRefreshRequest = null;
    }
  })();

  return activeRefreshRequest;
};

export const apiRequest = async <T>(
  endpoint: string,
  method: HttpMethod = "GET",
  body?: unknown,
  isFormData = false,
  options: ApiRequestOptions = {},
): Promise<T> => {
  if (!options.skipRefresh && refreshFailed) {
    const session = await getStoredSession();
    if (session.accessToken || session.refreshToken) {
      throw new Error("Session expired. Please log in again.");
    }
    refreshFailed = false;
  }

  const normalizedEndpoint = normalizeEndpoint(endpoint);
  const isRefreshEndpoint = normalizedEndpoint === REFRESH_ENDPOINT;

  let response = await performRequest(
    endpoint,
    method,
    body,
    isFormData,
    options,
  );

  if (!response.ok) {
    const errorPayload = await safeParseJson(response);

    if (
      !options.skipRefresh &&
      !isRefreshEndpoint &&
      (await shouldAttemptRefresh(response.status, errorPayload))
    ) {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        response = await performRequest(
          endpoint,
          method,
          body,
          isFormData,
          options,
        );
        if (response.ok) {
          return parseResponse<T>(response);
        }
      }

      await clearAuthSession();
      throw new Error("Session expired. Please log in again.");
    }

    throw new Error(extractMessage(errorPayload));
  }

  return parseResponse<T>(response);
};

const pickUserFromPayload = (payload?: Record<string, any>) =>
  (payload?.user as AuthenticatedUser | undefined) ||
  (payload?.data as AuthenticatedUser | undefined);

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
      {
        skipAuth: true,
      },
    );

    const responseData =
      response?.data && typeof response.data === "object"
        ? (response.data as Record<string, any>)
        : response;
    const accessToken = responseData?.access_token;
    const refreshToken = responseData?.refresh_token;
    const csrfToken = responseData?.csrf_token;
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
    const payload = response?.data;
    const directUser =
      payload && typeof payload === "object" && "id" in payload
        ? (payload as AuthenticatedUser)
        : pickUserFromPayload(payload as Record<string, any>);

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

export const updateCartItem = async (cartId: string, quantity: number) => {
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

const normalizeOptionalText = (value?: string | null) => {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
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

export const getNormalizedUserType = (userType?: string) =>
  normalizeUserType(userType);
