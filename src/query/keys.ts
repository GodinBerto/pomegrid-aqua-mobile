export const queryKeys = {
  auth: {
    currentUser: ["auth", "current-user"] as const,
  },
  catalog: {
    products: ["catalog", "products"] as const,
    product: (productId: string | number) =>
      ["catalog", "products", String(productId)] as const,
    services: ["catalog", "services"] as const,
  },
  commerce: {
    cart: ["commerce", "cart"] as const,
    orders: ["commerce", "orders"] as const,
  },
  support: {
    conversation: ["support", "conversation"] as const,
    messages: ["support", "messages"] as const,
    messagePage: (page: number, perPage: number) =>
      ["support", "messages", page, perPage] as const,
  },
};
