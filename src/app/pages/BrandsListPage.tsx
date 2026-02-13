import { useNavigate } from "react-router";
import { useBrands } from "../../hooks/useBrands";
import { useSettings } from "../../hooks/useSettings";
import { useIdleTimer } from "../../hooks/useIdleTimer";
import { kioskConfig } from "../../config/kiosk.config";
import { AttractOverlay } from "../components/kiosk/AttractOverlay";
import { AnimatePresence, motion } from "motion/react";
import { normalizeImageUrl } from "../../utils/imageUrl";

export function BrandsListPage() {
  const navigate = useNavigate();
  const { data: brands, isLoading, error } = useBrands();
  const { data: settings } = useSettings();

  const isIdle = useIdleTimer(
    settings?.idle_timeout || kioskConfig.behavior.idleTimeoutMs,
  );

  const handleBrandClick = (slug: string) => {
    navigate(`/${slug}`);
  };

  return (
    <>
      <div className="min-h-screen bg-white px-4 py-4 md:px-6 lg:px-8 lg:py-6">
        {/* Header with Logo */}
        <div className="max-w-[2000px] mx-auto mb-8 md:mb-12 lg:mb-16 flex justify-center">
          {settings?.site_logo ? (
            <img
              src={normalizeImageUrl(settings.site_logo)}
              alt={settings?.site_name || "Kiosk QR"}
              className="w-40 h-auto md:w-auto md:h-10 lg:h-12"
            />
          ) : (
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.2em] md:tracking-[0.3em] text-black">
              {settings?.site_name || "Kiosk QR"}
            </h1>
          )}
        </div>

        {/* Brands Grid */}
        <div className="max-w-[2000px] mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <p className="text-2xl text-gray-400 font-light">Yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-32">
              <p className="text-2xl text-red-400 font-light">
                Markalar yüklenemedi. Lütfen tekrar deneyin.
              </p>
            </div>
          ) : brands && brands.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {brands.map((brand, index) => (
                <motion.button
                  key={brand.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => handleBrandClick(brand.slug)}
                  className="group relative aspect-square bg-white border border-gray-200 rounded-lg md:rounded-xl lg:rounded-2xl overflow-hidden hover:border-black hover:shadow-xl transition-all duration-300"
                >
                  {brand.logo ? (
                    <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8 lg:p-10">
                      <img
                        src={normalizeImageUrl(brand.logo)}
                        alt={brand.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <h2 className="text-lg md:text-xl lg:text-2xl font-light tracking-[0.15em] md:tracking-[0.2em] text-gray-900 group-hover:text-black transition-colors">
                        {brand.name}
                      </h2>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-32">
              <p className="text-2xl text-gray-400 font-light">
                Henüz marka eklenmemiş
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Attract Mode Overlay - Desktop only (Kiosk mode) */}
      <AnimatePresence>
        {isIdle &&
          typeof window !== "undefined" &&
          window.innerWidth >= 768 && (
            <AttractOverlay
              screensaverLogo={settings?.screensaver_logo}
              siteName={settings?.site_name}
              slideshowImages={settings?.slideshow_images}
              slideshowInterval={settings?.slideshow_interval}
              slideshowTransition={settings?.slideshow_transition}
            />
          )}
      </AnimatePresence>
    </>
  );
}
