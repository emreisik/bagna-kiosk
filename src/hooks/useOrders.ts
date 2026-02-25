import { useMutation } from "@tanstack/react-query";
import {
  apiClient,
  type CreateOrderInput,
  type OrderResponse,
} from "../services/api";

export function useCreateOrder() {
  return useMutation<OrderResponse, Error, CreateOrderInput>({
    mutationFn: (input) => apiClient.createOrder(input),
  });
}
