import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../services/api";

interface Settings {
  site_logo: string;
  screensaver_logo: string;
  site_name: string;
  slideshow_images: string[];
  slideshow_interval: number; // milliseconds
  idle_timeout: number; // milliseconds
  slideshow_transition: string; // fade, slide, zoom, flip, kenburns
  grid_columns_mobile: string;
  grid_columns_tablet: string;
  grid_columns_desktop: string;
  grid_columns_kiosk: string;
  currency: string;
  show_product_info_on_cards: boolean; // Kart üzerinde ürün bilgisi göster
  product_info_position: "overlay" | "below"; // Bilgi pozisyonu: görsel üzerinde veya altında
  cache_version: string; // Cache version timestamp
}

export function useSettings() {
  return useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: async () => {
      const data = await apiClient.getSettings();
      const settingsObj: any = {};
      data.forEach((s: any) => {
        settingsObj[s.key] = s.value;
      });
      return {
        site_logo: settingsObj.site_logo || "",
        screensaver_logo: settingsObj.screensaver_logo || "",
        site_name: settingsObj.site_name || "Kiosk QR",
        slideshow_images: settingsObj.slideshow_images
          ? JSON.parse(settingsObj.slideshow_images)
          : [],
        slideshow_interval: settingsObj.slideshow_interval
          ? parseInt(settingsObj.slideshow_interval)
          : 4000,
        idle_timeout: settingsObj.idle_timeout
          ? parseInt(settingsObj.idle_timeout)
          : 30000,
        slideshow_transition: settingsObj.slideshow_transition || "fade",
        grid_columns_mobile: settingsObj.grid_columns_mobile || "2",
        grid_columns_tablet: settingsObj.grid_columns_tablet || "2",
        grid_columns_desktop: settingsObj.grid_columns_desktop || "3",
        grid_columns_kiosk: settingsObj.grid_columns_kiosk || "4",
        currency: settingsObj.currency || "$",
        show_product_info_on_cards:
          settingsObj.show_product_info_on_cards === "true",
        product_info_position: (settingsObj.product_info_position ||
          "below") as "overlay" | "below",
        cache_version: settingsObj.cache_version || "0",
      };
    },
    staleTime: 1000 * 60 * 5, // 5 dakika (daha kısa tuttuk)
    refetchInterval: 30000, // 30 saniyede bir kontrol et
    refetchOnWindowFocus: false,
  });
}
