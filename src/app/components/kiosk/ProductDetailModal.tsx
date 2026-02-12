import { X, ChevronDown } from "lucide-react";
import { Product } from "../../../data/products";
import { useI18n } from "../../../contexts/I18nContext";
import { useCurrency } from "../../../hooks/useCurrency";
import { motion, AnimatePresence } from "motion/react";
import { normalizeImageUrl } from "../../../utils/imageUrl";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  similarProducts: Product[];
  onSimilarProductClick: (product: Product) => void;
}

export function ProductDetailModal({
  product,
  onClose,
}: ProductDetailModalProps) {
  const { t } = useI18n();
  const currency = useCurrency();

  if (!product) return null;

  // Use images array if available, otherwise use single imageUrl
  const images = product.images || [product.imageUrl];

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />

          {/* Full Screen Modal - NO PADDING */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-50 overflow-y-auto"
          >
            {/* Close button - Fixed position */}
            <button
              onClick={onClose}
              className="fixed top-4 right-4 md:top-6 lg:top-8 md:right-6 lg:right-8 z-50 w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-2xl hover:bg-white transition-all hover:scale-110"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
            </button>

            {/* Scrollable Image Gallery - Full Screen */}
            <div className="w-full">
              {images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="w-full h-screen flex items-center justify-center bg-black overflow-hidden"
                >
                  <img
                    src={normalizeImageUrl(imageUrl)}
                    alt={`${product.title} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Scroll indicator - animated arrow */}
            {images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 1,
                }}
                className="fixed bottom-8 md:bottom-10 lg:bottom-12 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex flex-col items-center gap-2"
                >
                  <ChevronDown
                    className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white drop-shadow-2xl"
                    strokeWidth={1.5}
                  />
                  <ChevronDown
                    className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white drop-shadow-2xl -mt-6 md:-mt-7 lg:-mt-8"
                    strokeWidth={1.5}
                  />
                </motion.div>
              </motion.div>
            )}

            {/* Product Info Bar - Fixed Bottom - Single Row on All Devices */}
            <div className="fixed bottom-3 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-40 w-[96%] md:w-[92%] lg:w-[90%] max-w-6xl">
              <div className="bg-white/98 backdrop-blur-md rounded-lg md:rounded-xl lg:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="flex flex-row items-stretch divide-x divide-gray-200">
                  {/* Left: Product Code - Wider on Mobile Only */}
                  <div className="flex-[2] md:flex-1 px-2 py-2 md:px-6 md:py-4 lg:px-10 lg:py-6 flex flex-col justify-center min-w-0">
                    <p className="text-[9px] md:text-xs font-light text-gray-400 tracking-[0.05em] md:tracking-[0.2em] mb-0.5 md:mb-2 uppercase">
                      Product Code
                    </p>
                    <p className="text-[10px] md:text-lg lg:text-2xl font-light text-black tracking-tight whitespace-nowrap">
                      {product.productCode}
                    </p>
                  </div>

                  {/* Center: Size Range - Compact */}
                  <div className="flex-1 px-2 py-2 md:px-6 md:py-4 lg:px-10 lg:py-6 flex flex-col justify-center items-center min-w-0">
                    <p className="text-[9px] md:text-xs font-light text-gray-400 tracking-[0.1em] md:tracking-[0.2em] mb-0.5 md:mb-2 uppercase">
                      Size
                    </p>
                    <p className="text-lg md:text-3xl lg:text-5xl font-extralight text-black tracking-[0.15em] md:tracking-[0.3em]">
                      {product.sizeRange}
                    </p>
                  </div>

                  {/* Right: Price - Premium Black - Compact */}
                  <div className="flex-1 px-2 py-2 md:px-6 md:py-4 lg:px-10 lg:py-6 bg-black flex flex-col justify-center items-center min-w-0">
                    <p className="text-[9px] md:text-xs font-light text-white/60 tracking-[0.1em] md:tracking-[0.2em] mb-0.5 md:mb-2 uppercase">
                      Price
                    </p>
                    <p className="text-xl md:text-4xl lg:text-6xl font-extralight text-white tracking-wide md:tracking-wider">
                      {product.price.replace(/[$€₺£¥₽]+$/g, "").trim()}{" "}
                      {currency}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
