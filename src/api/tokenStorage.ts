import AsyncStorage from "@react-native-async-storage/async-storage";
import { isBrowserCookieRuntime } from "@/lib/platformStorage";
import type { SessionTokens } from "@/types/domain";

const ACCESS_TOKEN_STORAGE_KEY = "access_token";
const REFRESH_TOKEN_STORAGE_KEY = "refresh_token";
const CSRF_TOKEN_STORAGE_KEY = "csrf_token";

const tokenStorageKeys = [
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  CSRF_TOKEN_STORAGE_KEY,
] as const;

const cookieMaxAgeSeconds = 60 * 60 * 24 * 30;

const encodeCookieValue = (value: string) => encodeURIComponent(value);
const decodeCookieValue = (value: string) => decodeURIComponent(value);

const getCookieOptions = () => {
  const secureFlag =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  return `; Path=/; Max-Age=${cookieMaxAgeSeconds}; SameSite=Lax${secureFlag}`;
};

const setCookieValue = (key: string, value: string) => {
  if (!isBrowserCookieRuntime) return;

  document.cookie = `${key}=${encodeCookieValue(value)}${getCookieOptions()}`;
};

const getCookieValue = (key: string) => {
  if (!isBrowserCookieRuntime) return null;

  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf("=");
    if (separatorIndex === -1) continue;

    const cookieKey = cookie.slice(0, separatorIndex);
    const cookieValue = cookie.slice(separatorIndex + 1);

    if (cookieKey === key) {
      return decodeCookieValue(cookieValue);
    }
  }

  return null;
};

const clearCookieValue = (key: string) => {
  if (!isBrowserCookieRuntime) return;

  document.cookie = `${key}=; Path=/; Max-Age=0; SameSite=Lax`;
};

const readTokenValue = async (key: string) => {
  if (isBrowserCookieRuntime) {
    return getCookieValue(key);
  }

  return AsyncStorage.getItem(key);
};

const writeTokenValue = async (key: string, value: string) => {
  if (isBrowserCookieRuntime) {
    setCookieValue(key, value);
    return;
  }

  await AsyncStorage.setItem(key, value);
};

const removeTokenValue = async (key: string) => {
  if (isBrowserCookieRuntime) {
    clearCookieValue(key);
    return;
  }

  await AsyncStorage.removeItem(key);
};

export const readPersistedSession = async (): Promise<SessionTokens> => {
  const [accessToken, refreshToken, csrfToken] = await Promise.all(
    tokenStorageKeys.map((key) => readTokenValue(key)),
  );

  return {
    accessToken: accessToken || undefined,
    refreshToken: refreshToken || undefined,
    csrfToken: csrfToken || undefined,
  };
};

export const persistSessionTokens = async ({
  accessToken,
  refreshToken,
  csrfToken,
}: SessionTokens) => {
  await Promise.all([
    writeTokenValue(ACCESS_TOKEN_STORAGE_KEY, accessToken || ""),
    writeTokenValue(REFRESH_TOKEN_STORAGE_KEY, refreshToken || ""),
    writeTokenValue(CSRF_TOKEN_STORAGE_KEY, csrfToken || ""),
  ]);
};

export const clearPersistedSession = async () => {
  await Promise.all(tokenStorageKeys.map((key) => removeTokenValue(key)));
};
