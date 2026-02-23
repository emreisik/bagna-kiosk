import { useState } from "react";
import { Product } from "../../data/products";
import { GalleryGrid } from "../components/kiosk/GalleryGrid";
import { FilterSheet } from "../components/kiosk/FilterSheet";
import { ProductDetailModal } from "../components/kiosk/ProductDetailModal";
import { KioskButton } from "../components/kiosk/KioskButton";
import { useI18n } from "../../contexts/I18nContext";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { useIdleTimer } from "../../hooks/useIdleTimer";
import { AttractOverlay } from "../components/kiosk/AttractOverlay";
import { AnimatePresence, motion } from "motion/react";
import { kioskConfig } from "../../config/kiosk.config";
import { Language } from "../../i18n/translations";
import { useProducts, useSimilarProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useSettings } from "../../hooks/useSettings";
import { CategoryStructure } from "../../data/categories";
import { normalizeImageUrl } from "../../utils/imageUrl";

export function ProductsPage() {
  const { t, language, setLanguage, availableLanguages } = useI18n();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Fetch settings first (needed for idle timeout)
  const { data: settings } = useSettings();

  const isIdle = useIdleTimer(
    settings?.idle_timeout || kioskConfig.behavior.idleTimeoutMs,
  );

  // Fetch products from API
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useProducts({
    category: selectedCategory || undefined,
    subcategory: selectedSubcategory || undefined,
    search: searchQuery || undefined,
  });

  // Fetch categories for FilterSheet
  const { data: categoriesData } = useCategories();

  // Fetch similar products when a product is selected
  const { data: similarProducts } = useSimilarProducts(
    selectedProduct?.id,
    kioskConfig.modal.similarProductsCount,
  );

  const products = productsData?.products || [];
  const categories: CategoryStructure[] =
    categoriesData?.map((cat) => ({
      id: cat.name, // slug
      subcategories: cat.subcategories?.map((sub) => sub.name), // array of slugs
    })) || [];

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleSimilarProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (selectedSubcategory ? 1 : 0) +
    (searchQuery ? 1 : 0);

  // Language display names
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

  const languageOptions = availableLanguages.map((code) => ({
    code,
    name: languageNames[code] || code.toUpperCase(),
  }));

  return (
    <>
      <div className="min-h-screen bg-white px-4 py-4 md:px-6 lg:px-8 lg:py-6">
        {/* Logo Header with Language Selector */}
        <div className="max-w-[2000px] mx-auto mb-4 md:mb-6 lg:mb-8 flex justify-between items-center gap-2">
          <div className="flex-1 hidden md:block"></div>

          {/* Centered Logo or Brand Name */}
          <div className="flex-1 flex justify-start md:justify-center">
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

          {/* Language Selector - Right aligned */}
          <div className="flex-1 flex justify-end">
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

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isLangMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsLangMenuOpen(false)}
                    />

                    {/* Menu */}
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
          </div>
        </div>

        {/* Filter button and active filters */}
        <div className="max-w-[2000px] mx-auto mb-4 md:mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
            <p className="text-sm md:text-base lg:text-lg text-gray-600 font-light">
              {t("showingProducts").replace(
                "{count}",
                products.length.toString(),
              )}
            </p>

            <KioskButton
              variant="secondary"
              size="large"
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-1.5 md:gap-2 lg:gap-3 relative text-sm md:text-base px-3 md:px-4 lg:px-6 py-2 md:py-2.5 lg:py-3"
            >
              <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">{t("filters")}</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 bg-black text-white rounded-full text-[10px] md:text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </KioskButton>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {selectedCategory && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedSubcategory(null);
                  }}
                  className="inline-flex items-center gap-1 md:gap-1.5 lg:gap-2 px-2.5 md:px-3 lg:px-4 py-1.5 md:py-2 bg-black text-white rounded-full text-xs md:text-sm font-light tracking-wide hover:bg-gray-800 transition-colors"
                >
                  <span className="truncate max-w-[120px] md:max-w-none">
                    {t(`categories.${selectedCategory}`)}
                  </span>
                  <X className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                </button>
              )}
              {selectedSubcategory && (
                <button
                  onClick={() => setSelectedSubcategory(null)}
                  className="inline-flex items-center gap-1 md:gap-1.5 lg:gap-2 px-2.5 md:px-3 lg:px-4 py-1.5 md:py-2 bg-gray-900 text-white rounded-full text-xs md:text-sm font-light tracking-wide hover:bg-gray-700 transition-colors"
                >
                  <span className="truncate max-w-[120px] md:max-w-none">
                    {t(`subcategories.${selectedSubcategory}`)}
                  </span>
                  <X className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                </button>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-1 md:gap-1.5 lg:gap-2 px-2.5 md:px-3 lg:px-4 py-1.5 md:py-2 bg-gray-700 text-white rounded-full text-xs md:text-sm font-light tracking-wide hover:bg-gray-600 transition-colors"
                >
                  <span className="truncate max-w-[100px] md:max-w-none">
                    "{searchQuery}"
                  </span>
                  <X className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Gallery */}
        <div className="max-w-[2000px] mx-auto">
          {isLoadingProducts ? (
            <div className="flex items-center justify-center py-32">
              <p className="text-2xl text-gray-400 font-light">Loading...</p>
            </div>
          ) : productsError ? (
            <div className="flex items-center justify-center py-32">
              <p className="text-2xl text-red-400 font-light">
                Error loading products. Please try again.
              </p>
            </div>
          ) : products.length > 0 ? (
            <GalleryGrid
              products={products}
              onProductClick={handleProductClick}
              showTitles={false}
              showInfo={settings?.show_product_info_on_cards || false}
              infoPosition={settings?.product_info_position || "below"}
              currency={settings?.currency || "$"}
              columnsMobile={
                settings?.grid_columns_mobile
                  ? parseInt(settings.grid_columns_mobile)
                  : 2
              }
              columnsTablet={
                settings?.grid_columns_tablet
                  ? parseInt(settings.grid_columns_tablet)
                  : 2
              }
              columnsDesktop={
                settings?.grid_columns_desktop
                  ? parseInt(settings.grid_columns_desktop)
                  : 3
              }
              columnsKiosk={
                settings?.grid_columns_kiosk
                  ? parseInt(settings.grid_columns_kiosk)
                  : 3
              }
            />
          ) : (
            <div className="flex items-center justify-center py-32">
              <p className="text-2xl text-gray-400 font-light">
                {t("noProducts")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Sheet */}
      <FilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        searchQuery={searchQuery}
        onCategoryChange={setSelectedCategory}
        onSubcategoryChange={setSelectedSubcategory}
        onSearchChange={setSearchQuery}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        similarProducts={similarProducts || []}
        onSimilarProductClick={handleSimilarProductClick}
      />

      {/* Attract Mode Overlay */}
      <AnimatePresence>
        {isIdle && (
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
