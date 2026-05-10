import { useQuery } from "@tanstack/react-query";
import { getFarmServices, getProduct, getProducts } from "@/services/api";
import { queryKeys } from "./keys";

export const useProducts = () =>
  useQuery({
    queryKey: queryKeys.catalog.products,
    queryFn: async () => {
      const response = await getProducts();
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

export const useProduct = (productId?: string | number) =>
  useQuery({
    queryKey: queryKeys.catalog.product(productId || "unknown"),
    enabled: Boolean(productId),
    queryFn: async () => {
      const response = await getProduct(productId!);
      if (!response.success || !response.data) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

export const useFarmServices = () =>
  useQuery({
    queryKey: queryKeys.catalog.services,
    queryFn: async () => {
      const response = await getFarmServices();
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
