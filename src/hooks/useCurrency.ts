import { useState, useEffect } from "react";
import { apiClient } from "../services/api";

export function useCurrency(): string {
  const [currency, setCurrency] = useState<string>("$");

  useEffect(() => {
    fetchCurrency();
  }, []);

  const fetchCurrency = async () => {
    try {
      const settings = await apiClient.getSettings();
      const currencySetting = settings.find((s: any) => s.key === "currency");
      if (currencySetting) {
        setCurrency(currencySetting.value);
      }
    } catch (error) {
      console.error("Failed to fetch currency:", error);
      // Default to $ if fetch fails
    }
  };

  return currency;
}
