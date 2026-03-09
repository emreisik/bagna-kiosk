import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { normalizeImageUrl } from "../utils/imageUrl";

const API_URL = import.meta.env.VITE_API_URL || "/api";

function hideSplashScreen() {
  const splash = document.getElementById("splash-screen");
  if (!splash) return;
  splash.classList.add("fade-out");
  setTimeout(() => splash.remove(), 600);
}

async function updateSplashLogo() {
  try {
    const res = await fetch(`${API_URL}/settings`);
    if (!res.ok) return;
    const settings: Array<{ key: string; value: string }> = await res.json();
    const logoSetting = settings.find((s) => s.key === "site_logo");
    if (!logoSetting?.value) return;
    const logoEl = document.getElementById(
      "splash-logo",
    ) as HTMLImageElement | null;
    if (logoEl) {
      logoEl.src = normalizeImageUrl(logoSetting.value);
    }
  } catch {
    // Logo guncellenemezse favicon kalir
  }
}

export default function App() {
  useEffect(() => {
    // Splash logosunu API'den gelen gercek logo ile guncelle
    updateSplashLogo();

    // Sayfa icerigi ve gorseller yuklendikten sonra splash'i kapat
    if (document.readyState === "complete") {
      hideSplashScreen();
    } else {
      window.addEventListener("load", hideSplashScreen, { once: true });
      // Fallback: max 5 saniye sonra kapat
      const timeout = setTimeout(hideSplashScreen, 5000);
      return () => clearTimeout(timeout);
    }
  }, []);

  return <RouterProvider router={router} />;
}
