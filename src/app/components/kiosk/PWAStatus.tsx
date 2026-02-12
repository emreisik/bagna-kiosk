import { usePWA } from '../../../hooks/usePWA';
import { Smartphone } from 'lucide-react';

export function PWAStatus() {
  const { isInstalled } = usePWA();

  if (!isInstalled) return null;

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2">
      <Smartphone className="w-4 h-4" />
      <span className="text-xs font-light tracking-wide">Kiosk Mode</span>
    </div>
  );
}
