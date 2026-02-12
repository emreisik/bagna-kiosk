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

// Register Service Worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    console.log("PWA: New content available, please refresh.");
  },
  onOfflineReady() {
    console.log("PWA: App ready to work offline");
  },
  onRegistered(registration) {
    console.log("PWA: Service Worker registered", registration);
  },
  onRegisterError(error) {
    console.error("PWA: Service Worker registration failed", error);
  },
});

// Auto-update every hour
setInterval(
  () => {
    updateSW(true);
  },
  60 * 60 * 1000,
);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
