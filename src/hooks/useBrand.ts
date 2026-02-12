import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../services/api";

export function useBrand(slug: string | undefined) {
  return useQuery({
    queryKey: ["brand", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Brand slug is required");
      return await apiClient.getBrandBySlug(slug);
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
