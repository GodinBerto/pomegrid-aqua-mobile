import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToCart,
  getCartItems,
  getUserOrders,
  removeCartItem,
  updateCartItem,
} from "@/services/api";
import { queryKeys } from "./keys";

export const useCartQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.commerce.cart,
    enabled,
    queryFn: async () => {
      const response = await getCartItems();
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 30,
  });

export const useOrdersQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.commerce.orders,
    enabled,
    queryFn: async () => {
      const response = await getUserOrders();
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commerce.cart });
    },
  });
};

export const useUpdateCartItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cartId, quantity }: { cartId: string; quantity: number }) =>
      updateCartItem(cartId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commerce.cart });
    },
  });
};

export const useRemoveCartItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartId: number) => removeCartItem(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commerce.cart });
    },
  });
};
