import { useNavigate, useParams } from "react-router";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCart, getCartKey } from "../../../contexts/CartContext";
import { useCurrency } from "../../../hooks/useCurrency";
import { normalizeImageUrl } from "../../../utils/imageUrl";

function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^0-9.,]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function formatPrice(amount: number): string {
  return amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function CartSidebar() {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();
  const {
    items,
    removeItem,
    updateQuantity,
    isCartOpen,
    closeCart,
    itemCount,
  } = useCart();
  const currency = useCurrency();

  const subtotal = items.reduce((sum, item) => {
    const priceStr = item.selectedVariant?.price || item.product.price;
    return sum + parsePrice(priceStr) * item.quantity;
  }, 0);

  const handleCheckout = () => {
    closeCart();
    navigate(`/${brandSlug}/checkout`);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={closeCart}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-medium text-black">
                Sepetiniz
                <span className="text-gray-400 text-sm font-light ml-2">
                  ({itemCount})
                </span>
              </h2>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 font-light mb-1">Sepetiniz bos</p>
                <p className="text-sm text-gray-300 font-light">
                  Urun eklemek icin alisverise baslayin
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => {
                    const cartKey = getCartKey(item);
                    const priceStr =
                      item.selectedVariant?.price || item.product.price;
                    const unitPrice = parsePrice(priceStr);
                    const itemTotal = unitPrice * item.quantity;
                    const displaySizeRange =
                      item.selectedVariant?.sizeRange || item.product.sizeRange;
                    const displayColor = item.selectedVariant?.color;

                    return (
                      <motion.div
                        key={cartKey}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3"
                      >
                        {/* Image */}
                        <img
                          src={normalizeImageUrl(item.product.imageUrl)}
                          alt={item.product.title}
                          className="w-20 h-24 object-cover rounded-lg flex-shrink-0"
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="min-w-0 pr-2">
                              <p className="text-sm font-medium text-black truncate">
                                {item.product.title}
                              </p>
                              <p className="text-xs text-gray-400 font-light">
                                {item.product.productCode}
                              </p>
                              <p className="text-xs text-gray-400 font-light">
                                Beden: {displaySizeRange}
                              </p>
                              {displayColor && (
                                <p className="text-xs text-gray-400 font-light">
                                  Renk: {displayColor}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(cartKey)}
                              className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity */}
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() =>
                                  updateQuantity(cartKey, item.quantity - 1)
                                }
                                className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                <Minus className="w-3 h-3 text-gray-600" />
                              </button>
                              <span className="w-7 text-center text-xs font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(cartKey, item.quantity + 1)
                                }
                                className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                <Plus className="w-3 h-3 text-gray-600" />
                              </button>
                            </div>

                            {/* Price */}
                            <p className="text-sm font-semibold text-black">
                              {formatPrice(itemTotal)} {currency}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Toplam</span>
                  <span className="text-lg font-bold text-black">
                    {formatPrice(subtotal)} {currency}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-black text-white uppercase tracking-widest text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Siparisi Tamamla
                </button>
                <button
                  onClick={closeCart}
                  className="w-full py-2.5 text-sm text-gray-500 font-light hover:text-black transition-colors"
                >
                  Alisverise Devam Et
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
