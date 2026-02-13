import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { registerSW } from "virtual:pwa-register";
import App from "./app/App.tsx";
import "./styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Register Service Worker for PWA — otomatik güncelleme, anında aktif
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Yeni versiyon mevcut, otomatik güncelle
    updateSW(true);
  },
  onRegisterError(error) {
    console.error("SW registration failed:", error);
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
