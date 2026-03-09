import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router";
import { ArrowLeft, ShoppingBag, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "../../../contexts/I18nContext";
import { useCart } from "../../../contexts/CartContext";
import { useSettings } from "../../../hooks/useSettings";
import { normalizeImageUrl } from "../../../utils/imageUrl";

const languageNames: Record<string, string> = {
  en: "ENGLISH",
  tr: "TÜRKÇE",
  ru: "RUSSIAN",
  de: "DEUTSCH",
  fr: "FRANÇAIS",
  es: "ESPAÑOL",
  it: "ITALIANO",
  ar: "العربية",
  zh: "中文",
  ja: "日本語",
};

export function KioskHeader() {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage, availableLanguages } = useI18n();
  const { openCart, itemCount } = useCart();
  const { data: settings } = useSettings();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const languageOptions = availableLanguages.map((code) => ({
    code,
    name: languageNames[code] || code.toUpperCase(),
  }));

  // Anasayfa degilse geri butonu goster
  const isHome =
    location.pathname === "/" || location.pathname === `/${brandSlug}`;
  const showBack = !isHome && !!brandSlug;

  const handleBack = () => {
    navigate(`/${brandSlug || ""}`);
  };

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-[2000px] mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* LEFT: Back button or spacer */}
          <div className="flex-1 flex justify-start">
            {showBack ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-light uppercase tracking-wide hidden sm:inline">
                  {t("back")}
                </span>
              </button>
            ) : (
              <div />
            )}
          </div>

          {/* CENTER: Logo */}
          <div className="flex-shrink-0">
            {settings?.site_logo ? (
              <img
                src={normalizeImageUrl(settings.site_logo)}
                alt={settings?.site_name || "Kiosk QR"}
                style={{ width: settings.logo_width || 144 }}
                className="h-auto object-contain"
              />
            ) : (
              <h1 className="text-lg md:text-xl lg:text-2xl font-light tracking-[0.2em] md:tracking-[0.3em] text-black">
                {settings?.site_name || "Kiosk QR"}
              </h1>
            )}
          </div>

          {/* RIGHT: Cart + Language */}
          <div className="flex-1 flex justify-end items-center gap-2 md:gap-3">
            {/* Cart Icon */}
            <button
              onClick={openCart}
              className="relative p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-black" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-black text-white rounded-full text-[10px] font-medium flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            {/* Language Selector */}
            {languageOptions.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-3 lg:px-4 py-1.5 md:py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-[80px] md:min-w-[110px] lg:min-w-[140px] justify-between"
                >
                  <span className="text-xs md:text-sm font-medium uppercase truncate">
                    {languageOptions.find((opt) => opt.code === language)?.name}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 md:w-4 md:h-4 transition-transform flex-shrink-0 ${isLangMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isLangMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsLangMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-[80px] md:w-[110px] lg:w-[140px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
                      >
                        {languageOptions.map((option) => (
                          <button
                            key={option.code}
                            onClick={() => {
                              setLanguage(option.code);
                              setIsLangMenuOpen(false);
                            }}
                            className={`w-full px-2 md:px-3 lg:px-4 py-2 md:py-2.5 lg:py-3 text-left text-xs md:text-sm font-medium uppercase transition-colors ${
                              language === option.code
                                ? "bg-black text-white"
                                : "bg-white text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            {option.name}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
