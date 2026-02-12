import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../services/api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.getCategories(),
  });
}
