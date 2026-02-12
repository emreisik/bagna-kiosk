import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../services/api";

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      return await apiClient.getAllBrands();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
