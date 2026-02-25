import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useProduct } from "../../hooks/useProducts";
import { useCart } from "../../contexts/CartContext";
import { useSettings } from "../../hooks/useSettings";
import { useCurrency } from "../../hooks/useCurrency";
import { normalizeImageUrl } from "../../utils/imageUrl";
import type { ProductVariant } from "../../data/products";

export function ProductDetailPage() {
  const { brandSlug, productId } = useParams<{
    brandSlug: string;
    productId: string;
  }>();
  const navigate = useNavigate();
  const { addItem, itemCount, openCart } = useCart();
  const { data: product, isLoading } = useProduct(productId);
  const { data: settings } = useSettings();
  const currency = useCurrency();

  // Image gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Variant selection state
  const [selectedSizeRange, setSelectedSizeRange] = useState<string | null>(
    null,
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  const hasVariants =
    product?.variants !== undefined && product.variants.length > 0;

  // Unique size ranges
  const availableSizeRanges = useMemo(() => {
    if (!hasVariants || !product?.variants) return [];
    return [...new Set(product.variants.map((v) => v.sizeRange))];
  }, [product?.variants, hasVariants]);

  // Available colors for selected size range
  const availableColors = useMemo(() => {
    if (!hasVariants || !selectedSizeRange || !product?.variants) return [];
    return product.variants
      .filter((v) => v.sizeRange === selectedSizeRange)
      .map((v) => v.color);
  }, [product?.variants, selectedSizeRange, hasVariants]);

  // Find selected variant
  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (
      !hasVariants ||
      !selectedSizeRange ||
      !selectedColor ||
      !product?.variants
    )
      return null;
    return (
      product.variants.find(
        (v) => v.sizeRange === selectedSizeRange && v.color === selectedColor,
      ) || null
    );
  }, [product?.variants, selectedSizeRange, selectedColor, hasVariants]);

  // Reset selections when product changes
  useEffect(() => {
    setSelectedSizeRange(null);
    setSelectedColor(null);
    setSelectedImageIndex(0);
  }, [productId]);

  // Auto-select if only one size range
  useEffect(() => {
    if (availableSizeRanges.length === 1 && !selectedSizeRange) {
      setSelectedSizeRange(availableSizeRanges[0]);
    }
  }, [availableSizeRanges, selectedSizeRange]);

  // Auto-select if only one color for selected size range
  useEffect(() => {
    if (availableColors.length === 1 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors, selectedColor]);

  const images =
    product?.images || (product?.imageUrl ? [product.imageUrl] : []);

  // Swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && selectedImageIndex < images.length - 1) {
        setSelectedImageIndex((prev) => prev + 1);
      } else if (diff < 0 && selectedImageIndex > 0) {
        setSelectedImageIndex((prev) => prev - 1);
      }
    }
  }, [selectedImageIndex, images.length]);

  const goToPrevImage = () => {
    if (selectedImageIndex > 0) setSelectedImageIndex((prev) => prev - 1);
  };

  const goToNextImage = () => {
    if (selectedImageIndex < images.length - 1)
      setSelectedImageIndex((prev) => prev + 1);
  };

  // Displayed values
  const displayPrice = selectedVariant?.price || product?.price || "";
  const displaySizeRange = selectedSizeRange || product?.sizeRange || "";

  // Parse price for display
  const priceNumeric = displayPrice.replace(/[^0-9.,]/g, "").replace(",", ".");
  const priceFormatted = parseFloat(priceNumeric)
    ? parseFloat(priceNumeric).toLocaleString("tr-TR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : priceNumeric;

  // Varyantli urunlerde: beden secilmeli, renk secilmeli
  // Varyantsiz urunlerde: direkt eklenebilir
  const canAddToCart = !hasVariants || selectedVariant !== null;

  const handleAddToCart = () => {
    if (!product || !canAddToCart) return;
    addItem(product, selectedVariant || undefined);
    setAddedToCart(true);
    openCart();
    setTimeout(() => setAddedToCart(false), 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <p className="text-xl text-gray-400 font-light mb-6">Urun bulunamadi</p>
        <button
          onClick={() => navigate(`/${brandSlug || ""}`)}
          className="px-8 py-3 bg-black text-white uppercase tracking-widest text-sm font-medium rounded-lg"
        >
          Kataloga Don
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/${brandSlug || ""}`)}
              className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-light uppercase tracking-wide">
                Geri
              </span>
            </button>

            {settings?.site_logo ? (
              <img
                src={normalizeImageUrl(settings.site_logo)}
                alt={settings?.site_name || ""}
                style={{ width: Math.min(settings.logo_width || 144, 120) }}
                className="h-auto object-contain"
              />
            ) : (
              <h1 className="text-lg font-light tracking-[0.2em] text-black uppercase">
                {settings?.site_name || "Kiosk QR"}
              </h1>
            )}

            {/* Cart Icon */}
            <button
              onClick={openCart}
              className="relative p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-black" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-black text-white rounded-full text-[10px] font-medium flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Product Content - Shopify Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Sol: Gorsel Galerisi */}
          <div className="mb-8 lg:mb-0">
            {/* Ana Gorsel - Swipeable */}
            <div
              ref={galleryRef}
              className="relative aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden mb-3 select-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {images.length > 0 && (
                <img
                  src={normalizeImageUrl(images[selectedImageIndex])}
                  alt={`${product.title} - ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              )}

              {/* Arrow Buttons */}
              {images.length > 1 && (
                <>
                  {selectedImageIndex > 0 && (
                    <button
                      onClick={goToPrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                  )}
                  {selectedImageIndex < images.length - 1 && (
                    <button
                      onClick={goToNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  )}

                  {/* Dot Indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === selectedImageIndex
                            ? "bg-black w-4"
                            : "bg-black/30"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-20 md:w-20 md:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedImageIndex
                        ? "border-black"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={normalizeImageUrl(img)}
                      alt={`${product.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sag: Urun Bilgileri + Varyant Secimi */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {/* Urun Kodu */}
            <p className="text-xs text-gray-400 font-medium tracking-[0.15em] uppercase mb-1">
              {product.productCode}
            </p>

            {/* Baslik */}
            <h1 className="text-xl md:text-2xl font-medium text-black mb-4 leading-tight">
              {product.title}
            </h1>

            {/* Fiyat */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <p className="text-2xl md:text-3xl font-bold text-black">
                {priceFormatted} {currency}
              </p>
            </div>

            {/* Varyant Secimi */}
            {hasVariants ? (
              <div className="space-y-6 mb-8">
                {/* Beden Araligi Secimi */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-[0.15em] mb-3">
                    Beden Seciniz
                    {selectedSizeRange && (
                      <span className="ml-2 text-black normal-case tracking-normal">
                        — {selectedSizeRange}
                      </span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizeRanges.map((sr) => (
                      <button
                        key={sr}
                        onClick={() => {
                          setSelectedSizeRange(sr);
                          setSelectedColor(null);
                        }}
                        className={`px-4 py-2.5 border rounded-lg text-sm font-medium transition-all ${
                          selectedSizeRange === sr
                            ? "border-black bg-black text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {sr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Renk Secimi - sadece beden secildikten sonra gosterilir */}
                {selectedSizeRange && availableColors.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-[0.15em] mb-3">
                      Renk Seciniz
                      {selectedColor && (
                        <span className="ml-2 text-black normal-case tracking-normal">
                          — {selectedColor}
                        </span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2.5 border rounded-lg text-sm font-medium transition-all ${
                            selectedColor === color
                              ? "border-black bg-black text-white"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Secim uyarisi */}
                {!canAddToCart && (
                  <p className="text-xs text-gray-400 font-light">
                    {!selectedSizeRange
                      ? "Lutfen bir beden secin"
                      : "Lutfen bir renk secin"}
                  </p>
                )}
              </div>
            ) : (
              /* Varyant yoksa mevcut beden araligini goster */
              <div className="mb-8">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-[0.15em] mb-3">
                  Beden
                </label>
                <div className="inline-block px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
                  {displaySizeRange}
                </div>
              </div>
            )}

            {/* Sepete Ekle */}
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className={`w-full py-4 rounded-lg uppercase tracking-widest text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                addedToCart
                  ? "bg-green-600 text-white"
                  : canAddToCart
                    ? "bg-black text-white hover:bg-gray-900"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {addedToCart ? (
                <>
                  <Check className="w-4 h-4" />
                  Sepete Eklendi
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Sepete Ekle
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
