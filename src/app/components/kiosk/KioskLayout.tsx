import { ReactNode } from "react";
import { PWAInstallPrompt } from "./PWAInstallPrompt";
import { PWAStatus } from "./PWAStatus";
import { CartSidebar } from "./CartSidebar";

interface KioskLayoutProps {
  children: ReactNode;
}

export function KioskLayout({ children }: KioskLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main content - full screen */}
      <main className="flex-1">{children}</main>

      {/* PWA Status Indicator */}
      <PWAStatus />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Shopify-style Cart Sidebar */}
      <CartSidebar />
    </div>
  );
}
