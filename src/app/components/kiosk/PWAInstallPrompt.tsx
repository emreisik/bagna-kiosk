import { useState, useEffect } from 'react';
import { usePWA } from '../../../hooks/usePWA';
import { useI18n } from '../../../contexts/I18nContext';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X } from 'lucide-react';

export function PWAInstallPrompt() {
  const { isInstallable, installPWA } = usePWA();
  const { t, language } = useI18n();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show prompt after 3 seconds if installable and not dismissed
    if (isInstallable && !dismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, dismissed]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    // Store in localStorage to not show again in this session
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const messages = {
    tr: {
      title: 'Kiosk Moduna Geç',
      description: 'Tam ekran kiosk deneyimi için uygulamayı yükleyin',
      install: 'Yükle',
      dismiss: 'Şimdi Değil'
    },
    en: {
      title: 'Switch to Kiosk Mode',
      description: 'Install the app for fullscreen kiosk experience',
      install: 'Install',
      dismiss: 'Not Now'
    },
    ru: {
      title: 'Переключиться в режим киоска',
      description: 'Установите приложение для полноэкранного режима',
      install: 'Установить',
      dismiss: 'Не сейчас'
    }
  };

  const msg = messages[language];

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-8 right-8 z-[100] bg-black text-white rounded-2xl shadow-2xl p-6 max-w-md"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 pr-8">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-light tracking-wide mb-2">
                {msg.title}
              </h3>
              <p className="text-sm text-white/70 font-light mb-4">
                {msg.description}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleInstall}
                  className="px-6 py-2 bg-white text-black rounded-lg font-light tracking-wide hover:bg-white/90 transition-colors"
                >
                  {msg.install}
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-6 py-2 bg-white/10 text-white rounded-lg font-light tracking-wide hover:bg-white/20 transition-colors"
                >
                  {msg.dismiss}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
