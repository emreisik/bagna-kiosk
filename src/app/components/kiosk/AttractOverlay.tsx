import { useI18n } from "../../../contexts/I18nContext";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Language } from "../../../i18n/translations";
import { QrCode } from "lucide-react";
import { useNavigate } from "react-router";
import { normalizeImageUrl } from "../../../utils/imageUrl";

interface AttractOverlayProps {
  screensaverLogo?: string;
  siteName?: string;
  slideshowImages?: string[];
  slideshowInterval?: number;
  slideshowTransition?: string;
}

export function AttractOverlay({
  screensaverLogo,
  siteName,
  slideshowImages = [],
  slideshowInterval = 4000,
  slideshowTransition = "fade",
}: AttractOverlayProps = {}) {
  const { t, availableLanguages } = useI18n();
  const navigate = useNavigate();
  const [rotatingLanguage, setRotatingLanguage] = useState<Language>(
    availableLanguages[0] || "tr",
  );
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const qrBufferRef = useRef<string>("");
  const qrTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        };
      case "slide":
        return {
          initial: { opacity: 0, x: "100%" },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: "-100%" },
          transition: { duration: 0.7, ease: "easeInOut" },
        };
      case "zoom":
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.2 },
          transition: { duration: 0.8, ease: "easeOut" },
        };
      case "flip":
        return {
          initial: { opacity: 0, rotateY: -90 },
          animate: { opacity: 1, rotateY: 0 },
          exit: { opacity: 0, rotateY: 90 },
          transition: { duration: 0.7, ease: "easeInOut" },
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
            scale: { duration: slideshowInterval / 1000, ease: "linear" },
            x: { duration: slideshowInterval / 1000, ease: "easeInOut" },
            y: { duration: slideshowInterval / 1000, ease: "easeInOut" },
          },
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.8 },
        };
    }
  };

  // Debug: Log slideshow images
  useEffect(() => {
    console.log("Slideshow Images:", slideshowImages);
    console.log("All Product Images:", allProductImages);
    console.log("Slideshow Interval:", slideshowInterval);
  }, [slideshowImages, allProductImages, slideshowInterval]);

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
      setCurrentProductIndex((prev) => {
        const next = (prev + 1) % allProductImages.length;
        console.log("Image rotation:", prev, "→", next);
        return next;
      });
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
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden"
      style={{ cursor: "pointer" }}
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Split Screen Layout */}
      <div className="relative z-10 w-full h-full flex">
        {/* Left Side - Brand & Text Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-16 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-8"
          >
            {/* Logo or Brand Name */}
            {screensaverLogo ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-6 w-full max-w-md mx-auto"
              >
                <img
                  src={normalizeImageUrl(screensaverLogo)}
                  alt={siteName || "Kiosk QR"}
                  className="w-full max-h-40 object-contain mx-auto"
                />
              </motion.div>
            ) : (
              <h1 className="text-7xl font-extralight tracking-[0.3em] text-white">
                {siteName || "Kiosk QR"}
              </h1>
            )}

            {/* Slogan - rotating with animation */}
            <motion.p
              key={`slogan-${rotatingLanguage}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-light tracking-widest text-white/80"
            >
              {getRotatingText("slogan")}
            </motion.p>

            {/* Attract message - rotating with animation */}
            <motion.div
              key={`message-${rotatingLanguage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 10, 0] }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.5 },
                y: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="text-lg tracking-wider text-white/60 uppercase"
            >
              {getRotatingText("attractMessage")}
            </motion.div>

            {/* QR Code Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-12 pt-12 border-t border-white/20"
            >
              {/* QR Code */}
              <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl mb-4">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>

              {/* QR Label */}
              <motion.p
                key={`qr-${rotatingLanguage}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-sm tracking-wide text-white/70 flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                {getRotatingText("scanQR")}
              </motion.p>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Product Showcase Slideshow */}
        <div className="flex-1 relative overflow-hidden">
          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/50 z-10 pointer-events-none" />

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
                onError={(e) => {
                  console.error(
                    "Image failed to load:",
                    allProductImages[currentProductIndex],
                  );
                }}
                onLoad={() => {
                  console.log(
                    "Image loaded:",
                    allProductImages[currentProductIndex],
                  );
                }}
              />

              {/* Gradient overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Product counter indicator */}
          <div className="absolute bottom-8 right-8 z-20 flex gap-2">
            {allProductImages.slice(0, 10).map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentProductIndex % 10
                    ? "w-8 bg-white"
                    : "w-1 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
