import Constants from "expo-constants";
import { Platform } from "react-native";
import { clearAuthenticatedQueryCache } from "@/query/cache";
import { useAuthStore } from "@/store/authStore";
import { extractMessage } from "@/lib/utils";
import type { SessionTokens } from "@/types/domain";
import {
  clearPersistedSession,
  persistSessionTokens,
  readPersistedSession,
} from "./tokenStorage";

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

  await persistSessionTokens({
    accessToken,
    refreshToken,
    csrfToken,
  });
};

export const clearAuthSession = async () => {
  inMemorySession = {
    accessToken: undefined,
    refreshToken: undefined,
    csrfToken: undefined,
  };
  refreshFailed = false;

  await clearPersistedSession();

  clearAuthenticatedQueryCache();
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
