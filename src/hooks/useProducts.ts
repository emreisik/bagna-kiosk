import { useQuery } from "@tanstack/react-query";
import { apiClient, type ProductFilters } from "../services/api";

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => apiClient.getProducts(filters),
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => {
      if (!id) throw new Error("Product ID is required");
      return apiClient.getProductById(id);
    },
    enabled: !!id,
  });
}

export function useSimilarProducts(id: string | undefined, limit = 6) {
  return useQuery({
    queryKey: ["similar-products", id, limit],
    queryFn: () => {
      if (!id) throw new Error("Product ID is required");
      return apiClient.getSimilarProducts(id, limit);
    },
    enabled: !!id,
  });
}
