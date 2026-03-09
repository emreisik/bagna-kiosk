import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";

function hideSplashScreen() {
  const splash = document.getElementById("splash-screen");
  if (!splash) return;
  splash.classList.add("fade-out");
  setTimeout(() => splash.remove(), 600);
}

export default function App() {
  useEffect(() => {
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
