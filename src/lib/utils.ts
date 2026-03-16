import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  ApiEnvelope,
  AuthenticatedUser,
  ChatMessage,
  ConversationRecord,
  MessageRecord,
  PaginationMeta,
  Product,
  ProductCategory,
} from "@/types/domain";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatCurrency = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount || 0);

export const formatDate = (value?: string | null) => {
  if (!value) return "N/A";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return "N/A";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
};

export const toIsoDate = (value?: string) => {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

export const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const buildQueryString = (params: Record<string, unknown>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

export const extractListData = <T>(payload: unknown, preferredKeys: string[] = []) => {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  const keys = [...preferredKeys, "data", "results", "items", "rows", "messages", "payments"];

  for (const key of keys) {
    const candidate = record[key];
    if (Array.isArray(candidate)) return candidate as T[];
  }

  return [];
};

export const extractSingleData = <T>(payload: unknown, preferredKeys: string[] = []) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return undefined;

  const record = payload as Record<string, unknown>;
  const keys = [...preferredKeys, "data", "item", "result", "conversation", "message", "payment"];

  for (const key of keys) {
    const candidate = record[key];
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      return candidate as T;
    }
  }

  return undefined;
};

export const extractMeta = (payload: Record<string, any>, fallback?: Partial<PaginationMeta>) => {
  const meta = payload.meta || payload.pagination || payload.page;
  if (!meta) {
    return fallback
      ? { page: 1, per_page: 20, total: 0, pages: 0, ...fallback }
      : undefined;
  }

  return {
    page: toNumber(meta.page, fallback?.page ?? 1),
    per_page: toNumber(meta.per_page ?? meta.perPage, fallback?.per_page ?? 20),
    total: toNumber(meta.total, fallback?.total ?? 0),
    pages: toNumber(meta.pages, fallback?.pages ?? 0),
  };
};

export const extractMessage = (payload: unknown, fallback = "Something went wrong") => {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as Record<string, any>;
  return record.message || record.msg || record.error || fallback;
};

export const normalizeCategoryName = (name?: string): ProductCategory | "" => {
  if (!name) return "";

  const trimmed = name.trim().toLowerCase();
  const aliases: Record<string, ProductCategory> = {
    fish: "Fish",
    "live stock": "Live Stock",
    livestock: "Live Stock",
    vegetable: "Vegetables",
    vegetables: "Vegetables",
    fruit: "Fruits",
    fruits: "Fruits",
    "farm equipment": "Farm Equipment",
    equipment: "Farm Equipment",
    pumps: "Farm Equipment",
  };

  return aliases[trimmed] || (name as ProductCategory);
};

export const getPrimaryProductImage = (product?: Partial<Product>) =>
  product?.image_urls?.[0] ||
  product?.image_url ||
  (typeof product?.image === "string" ? product.image : undefined);

export const normalizeUserType = (userType?: string) => {
  if (!userType) return userType;
  if (userType === "worker") return "farmer";
  if (userType === "user") return "consumer";
  return userType;
};

export const normalizeAuthenticatedUser = (user: AuthenticatedUser): AuthenticatedUser => ({
  ...user,
  id: String(user.id),
  user_type: normalizeUserType(user.user_type),
  is_admin: Boolean(user.is_admin),
  is_active: typeof user.is_active === "boolean" ? user.is_active : Boolean(user.is_active),
});

export const mapConversationMessage = (message: MessageRecord, fallbackSenderName?: string): ChatMessage => ({
  id: String(message.id),
  senderId: String(message.sender_id),
  receiverId: String(message.receiver_id),
  content: message.content,
  timestamp: new Date(toIsoDate(message.created_at)),
  isRead: Boolean(message.is_read),
  senderName: message.sender_name || fallbackSenderName || "Support",
});

export const getConversationUnreadCount = (conversation?: ConversationRecord) =>
  toNumber(conversation?.unread_count ?? conversation?.unreadCount);

export const getResponseStatus = (payload?: ApiEnvelope | Record<string, unknown>) =>
  typeof payload?.status === "number" ? payload.status : 200;

export const getChatDayLabel = (date: Date) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return formatDate(date.toISOString());
};
