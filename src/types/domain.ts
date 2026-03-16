export type ProductCategory =
  | "Live Stock"
  | "Fish"
  | "Vegetables"
  | "Fruits"
  | "Farm Equipment";

export interface Product {
  id?: string | number;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  animal_type?: number;
  image?: string;
  quantity: number;
  weight_per_unit: string | number;
  rating?: number;
  discount_percentage?: number;
  isFeatured?: boolean;
  animal_stage?: number;
  is_alive?: boolean;
  is_fresh?: boolean;
  image_url?: string;
  image_urls?: string[];
  video_urls?: string[];
}

export interface AuthenticatedUser {
  id: string | number;
  username?: string;
  full_name: string;
  email: string;
  phone?: string;
  user_type?: string;
  address?: string;
  is_admin?: boolean | number;
  is_active?: boolean | number;
  date_of_birth?: string;
}

export interface SessionTokens {
  accessToken?: string;
  refreshToken?: string;
  csrfToken?: string;
}

export interface ApiEnvelope<T = unknown> {
  data?: T;
  message?: string;
  status?: number;
  success?: boolean;
  [key: string]: unknown;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  pages: number;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  status: number;
  meta?: PaginationMeta;
}

export interface ApiSingleResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  status: number;
}

export interface CartItem {
  cart_id: string;
  product_id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  totalPrice: number;
}

export interface AddToCartPayload {
  product_id: number;
  quantity: number;
}

export interface OrderItem {
  id: number;
  name: string;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  user_id: number;
}

export interface Order {
  id: number;
  user_id: number;
  status: string;
  total_price: number;
  payment_method?: string;
  payment_status?: string;
  payment_reference?: string;
  paid_at?: string | null;
  shipping_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface PaymentRecord {
  id: string | number;
  user_id: string | number;
  order_id?: string | number | null;
  provider?: string | null;
  reference: string;
  access_code?: string | null;
  authorization_url?: string | null;
  amount: number;
  currency?: string | null;
  status: string;
  gateway_response?: string | null;
  gateway_payload?: Record<string, unknown>;
  channel?: string | null;
  customer_email?: string | null;
  metadata?: Record<string, unknown>;
  paid_at?: string | null;
  created_at?: string;
  updated_at?: string;
  order_status?: string | null;
  order_total?: number | null;
  order_payment_status?: string | null;
}

export type ServiceIconKey = "users" | "settings" | "graduationCap" | "wrench";
export type ServiceTier = "basic" | "premium" | "enterprise";

export interface ServicePricingOption {
  price: number;
  duration: string;
}

export interface FarmService {
  id?: string | number;
  title: string;
  description: string;
  icon: ServiceIconKey;
  features: string[];
  pricing: Record<ServiceTier, ServicePricingOption>;
}

export interface ConversationRecord {
  id: string;
  user_id: string | number;
  admin_id?: string | number | null;
  user_name?: string;
  user_email?: string;
  last_message_at?: string;
  lastMessageAt?: string;
  unread_count?: number;
  unreadCount?: number;
  latest_message?: string;
  latestMessage?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MessageRecord {
  id: string | number;
  conversation_id: string;
  sender_id: string | number;
  receiver_id: string | number;
  content: string;
  is_read?: boolean;
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  senderName: string;
}

export interface CreateOrderItemPayload {
  product_id: number;
  quantity: number;
}

export interface CreateOrderPayload {
  items: CreateOrderItemPayload[];
  payment_method?: string | null;
  shipping_address?: string | null;
  notes?: string | null;
}

export interface InitializePaymentPayload {
  order_id?: string | number;
  amount?: number;
  email?: string;
  currency?: string;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}

export type ShippingMethod = "standard" | "express" | "pickup";
export type PaymentMethod = "card" | "mobile" | "cod";

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  shippingMethod: ShippingMethod | "";
  paymentMethod: PaymentMethod | "";
}

export type MobileProvider = "mtn" | "airteltigo" | "telecel" | "";

export interface PendingOnlinePayment {
  orderId: number;
  reference: string;
  cartItemIds: number[];
  paymentMethod: string;
  createdAt: string;
}
