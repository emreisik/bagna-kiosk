import { useI18n } from "../../../contexts/I18nContext";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Language } from "../../../i18n/translations";
import { useNavigate } from "react-router";
import { normalizeImageUrl } from "../../../utils/imageUrl";

interface AttractOverlayProps {
  screensaverLogo?: string;
  siteName?: string;
  slideshowImages?: string[];
  slideshowInterval?: number;
  slideshowTransition?: string;
  brandLogo?: string;
  brandName?: string;
}

export function AttractOverlay({
  screensaverLogo,
  siteName,
  slideshowImages = [],
  slideshowInterval = 4000,
  slideshowTransition = "fade",
  brandLogo,
  brandName,
}: AttractOverlayProps = {}) {
  const isBrandMode = !!brandLogo;
  const { availableLanguages } = useI18n();
  const navigate = useNavigate();
  const [rotatingLanguage, setRotatingLanguage] = useState<Language>(
    availableLanguages[0] || "tr",
  );
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const qrBufferRef = useRef<string>("");
  const qrTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use slideshow images from settings, or show placeholder
  const allProductImages =
    slideshowImages.length > 0
      ? slideshowImages
      : ["https://images.unsplash.com/photo-1441986300917-64674bd600d8"];

  // Transition variants
  const getTransitionVariants = () => {
    switch (slideshowTransition) {
      case "fade":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.8 },
        } as const;
      case "slide":
        return {
          initial: { opacity: 0, x: "100%" },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: "-100%" },
          transition: { duration: 0.7, ease: "easeInOut" as const },
        };
      case "zoom":
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.2 },
          transition: { duration: 0.8, ease: "easeOut" as const },
        };
      case "flip":
        return {
          initial: { opacity: 0, rotateY: -90 },
          animate: { opacity: 1, rotateY: 0 },
          exit: { opacity: 0, rotateY: 90 },
          transition: { duration: 0.7, ease: "easeInOut" as const },
        };
      case "kenburns":
        return {
          initial: { opacity: 0, scale: 1 },
          animate: {
            opacity: 1,
            scale: [1, 1.15, 1.1],
            x: [0, -30, -20],
            y: [0, -20, -10],
          },
          exit: { opacity: 0 },
          transition: {
            opacity: { duration: 0.8 },
            scale: {
              duration: slideshowInterval / 1000,
              ease: "linear" as const,
            },
            x: {
              duration: slideshowInterval / 1000,
              ease: "easeInOut" as const,
            },
            y: {
              duration: slideshowInterval / 1000,
              ease: "easeInOut" as const,
            },
          },
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.8 },
        } as const;
    }
  };

  // Rotate languages every 10 seconds
  useEffect(() => {
    if (availableLanguages.length === 0) return;

    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % availableLanguages.length;
      setRotatingLanguage(availableLanguages[currentIndex]);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [availableLanguages]);

  // Rotate product images with configurable interval
  useEffect(() => {
    if (allProductImages.length <= 1) return; // Don't rotate if only 1 image

    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % allProductImages.length);
    }, slideshowInterval);

    return () => clearInterval(interval);
  }, [allProductImages.length, slideshowInterval]);

  // QR Code Scanner Listener
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      // Clear previous timer
      if (qrTimerRef.current) {
        clearTimeout(qrTimerRef.current);
      }

      // Enter key = end of QR code scan
      if (event.key === "Enter" && qrBufferRef.current.length > 0) {
        const scannedData = qrBufferRef.current.trim();
        console.log("QR Code scanned:", scannedData);

        // Parse and navigate to URL
        try {
          // Check if it's a full URL or relative path
          if (
            scannedData.startsWith("http://") ||
            scannedData.startsWith("https://")
          ) {
            // Full URL - extract path
            const url = new URL(scannedData);
            navigate(url.pathname);
          } else if (scannedData.startsWith("/")) {
            // Relative path - navigate directly
            navigate(scannedData);
          } else {
            // Assume it's a path without leading slash
            navigate("/" + scannedData);
          }
        } catch (error) {
          console.error("Failed to parse QR code URL:", error);
        }

        // Clear buffer
        qrBufferRef.current = "";
      } else if (event.key.length === 1) {
        // Regular character - add to buffer
        qrBufferRef.current += event.key;

        // Auto-clear buffer after 100ms of inactivity (QR scanners are fast)
        qrTimerRef.current = setTimeout(() => {
          qrBufferRef.current = "";
        }, 100);
      }
    };

    // Add event listener
    document.addEventListener("keypress", handleKeyPress);

    // Cleanup
    return () => {
      document.removeEventListener("keypress", handleKeyPress);
      if (qrTimerRef.current) {
        clearTimeout(qrTimerRef.current);
      }
    };
  }, [navigate]);

  // Get translated text for rotating language
  const getRotatingText = (key: string): string => {
    const translations = {
      tr: {
        slogan: "Minimal Katalog Deneyimi",
        attractMessage: "Keşfetmek için dokunun",
        scanQR: "Mobil Katalog için QR Kodu Tarayın",
      },
      en: {
        slogan: "Minimal Catalog Experience",
        attractMessage: "Touch to explore",
        scanQR: "Scan QR Code for Mobile Catalog",
      },
      ru: {
        slogan: "Минимальный Каталог",
        attractMessage: "Нажмите для просмотра",
        scanQR: "Сканируйте QR для мобильного каталога",
      },
    };

    return (
      translations[rotatingLanguage][key as keyof typeof translations.tr] || ""
    );
  };

  // Generate QR code URL (using a QR API service)
  // Use full URL (including path) so QR code points to current page
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&color=000000&bgcolor=FFFFFF`;

  // Marka modu: beyaz minimal tasarım
  if (isBrandMode) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white overflow-hidden"
        style={{ cursor: "pointer" }}
      >
        {/* Marka logosu - merkez, büyük */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-8 md:gap-12"
        >
          <img
            src={normalizeImageUrl(brandLogo)}
            alt={brandName || "Brand"}
            className="max-h-28 md:max-h-40 lg:max-h-48 w-auto object-contain"
          />

          {/* İnce ayırıcı çizgi */}
          <div className="w-12 h-px bg-gray-200" />

          {/* QR Code - minimal */}
          <div className="p-2 rounded-lg border border-gray-100">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-20 h-20 md:w-24 md:h-24"
            />
          </div>

          {/* Dönen mesaj */}
          <motion.p
            key={`msg-${rotatingLanguage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xs md:text-sm tracking-widest text-gray-300 uppercase"
          >
            {getRotatingText("attractMessage")}
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-black overflow-hidden"
      style={{ cursor: "pointer" }}
    >
      {/* Top: QR + Logo + Text */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center px-6 py-8 md:py-12 text-center bg-black">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center gap-4 md:gap-6"
        >
          {/* Logo */}
          {screensaverLogo ? (
            <img
              src={normalizeImageUrl(screensaverLogo)}
              alt={siteName || "Kiosk QR"}
              className="max-h-12 md:max-h-16 w-auto object-contain"
            />
          ) : (
            <h1 className="text-2xl md:text-4xl font-extralight tracking-[0.3em] text-white">
              {siteName || "Kiosk QR"}
            </h1>
          )}

          {/* QR Code */}
          <div className="bg-white p-2.5 md:p-3 rounded-xl">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-24 h-24 md:w-32 md:h-32"
            />
          </div>

          {/* Rotating message */}
          <motion.p
            key={`msg-${rotatingLanguage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xs md:text-sm tracking-widest text-white/50 uppercase"
          >
            {getRotatingText("attractMessage")}
          </motion.p>
        </motion.div>
      </div>

      {/* Bottom: Image Slideshow */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`slide-${currentProductIndex}`}
            {...getTransitionVariants()}
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <img
              src={normalizeImageUrl(allProductImages[currentProductIndex])}
              alt={`Slide ${currentProductIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Subtle top gradient for seamless blend */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Slide indicator */}
        {allProductImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {allProductImages.slice(0, 10).map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentProductIndex % 10
                    ? "w-6 bg-white"
                    : "w-1 bg-white/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
