import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import {
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  Check,
  ShoppingBag,
} from "lucide-react";
import { useCart, getCartKey } from "../../contexts/CartContext";
import { useCreateOrder } from "../../hooks/useOrders";
import { useSettings } from "../../hooks/useSettings";
import { useCurrency } from "../../hooks/useCurrency";
import { normalizeImageUrl } from "../../utils/imageUrl";
import { motion, AnimatePresence } from "motion/react";

const WHATSAPP_NUMBER = "905385717136";

const countryCodes = [
  { code: "+90", flag: "\ud83c\uddf9\ud83c\uddf7", label: "TR" },
  { code: "+1", flag: "\ud83c\uddfa\ud83c\uddf8", label: "US" },
  { code: "+44", flag: "\ud83c\uddec\ud83c\udde7", label: "UK" },
  { code: "+49", flag: "\ud83c\udde9\ud83c\uddea", label: "DE" },
  { code: "+33", flag: "\ud83c\uddeb\ud83c\uddf7", label: "FR" },
  { code: "+7", flag: "\ud83c\uddf7\ud83c\uddfa", label: "RU" },
  { code: "+966", flag: "\ud83c\uddf8\ud83c\udde6", label: "SA" },
  { code: "+971", flag: "\ud83c\udde6\ud83c\uddea", label: "AE" },
];

interface CheckoutForm {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

/** Fiyat stringinden sayisal degeri cikar: "145$" -> 145, "1,200$" -> 1200 */
function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^0-9.,]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

/** Fiyati formatla: 1200 -> "1.200" */
function formatPrice(amount: number): string {
  return amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function buildWhatsAppMessage(
  orderNumber: string,
  form: CheckoutForm,
  countryCode: string,
  currency: string,
  items: {
    productCode: string;
    title: string;
    sizeRange: string;
    color?: string;
    quantity: number;
    price: string;
  }[],
  total: number,
) {
  const lines = [
    `*YENI SIPARIS - ${orderNumber}*`,
    "",
    `*Musteri:* ${form.firstName} ${form.lastName}`,
    `*Telefon:* ${countryCode}${form.phone}`,
    `*Adres:* ${form.address}`,
    "",
    "*URUNLER:*",
    ...items.map((item) => {
      const itemPrice = parsePrice(item.price);
      const subtotal = itemPrice * item.quantity;
      const colorInfo = item.color ? ` | ${item.color}` : "";
      return `- ${item.productCode} | ${item.title} | ${item.sizeRange}${colorInfo} | x${item.quantity} | ${formatPrice(subtotal)} ${currency}`;
    }),
    "",
    `*TOPLAM:* ${formatPrice(total)} ${currency}`,
    "",
    `*Siparis Tarihi:* ${new Date().toLocaleDateString("tr-TR")}`,
  ];

  return lines.join("\n");
}

export function CheckoutPage() {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const { data: settings } = useSettings();
  const currency = useCurrency();
  const createOrder = useCreateOrder();
  const [countryCode, setCountryCode] = useState("+90");
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>();

  // Fiyat hesaplamalari - varyant fiyati oncelikli
  const cartCalculations = useMemo(() => {
    let subtotal = 0;
    const itemSubtotals = items.map((item) => {
      const priceStr = item.selectedVariant?.price || item.product.price;
      const unitPrice = parsePrice(priceStr);
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;
      return { unitPrice, itemTotal };
    });
    return { subtotal, itemSubtotals };
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) return;

    const orderItems = items.map((item) => ({
      productId: item.product.id,
      productCode: item.product.productCode,
      title: item.product.title,
      price: item.selectedVariant?.price || item.product.price,
      sizeRange: item.selectedVariant?.sizeRange || item.product.sizeRange,
      imageUrl: item.product.imageUrl,
      quantity: item.quantity,
      variantId: item.selectedVariant?.id,
      color: item.selectedVariant?.color,
    }));

    try {
      const order = await createOrder.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: `${countryCode}${data.phone}`,
        address: data.address,
        brandSlug,
        items: orderItems,
      });

      const message = buildWhatsAppMessage(
        order.orderNumber,
        data,
        countryCode,
        currency,
        orderItems,
        cartCalculations.subtotal,
      );
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");

      setOrderSuccess(order.orderNumber);
      clearCart();
    } catch {
      alert("Siparis olusturulamadi. Lutfen tekrar deneyin.");
    }
  };

  // Basari ekrani
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-black flex items-center justify-center mb-6"
        >
          <Check className="w-10 h-10 md:w-12 md:h-12 text-white" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-light tracking-wide text-black mb-2">
          SIPARIS ALINDI
        </h2>
        <p className="text-gray-500 font-light mb-1">{orderSuccess}</p>
        <p className="text-sm text-gray-400 font-light mb-8">
          WhatsApp uzerinden bilgilendirileceksiniz.
        </p>
        <button
          onClick={() => navigate(`/${brandSlug || ""}`)}
          className="px-8 py-3 bg-black text-white uppercase tracking-widest text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors"
        >
          Alisverise Devam Et
        </button>
      </div>
    );
  }

  // Bos sepet
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <p className="text-xl text-gray-400 font-light mb-2">Sepetiniz bos</p>
        <p className="text-sm text-gray-300 font-light mb-8">
          Urun eklemek icin kataloga donun
        </p>
        <button
          onClick={() => navigate(`/${brandSlug || ""}`)}
          className="px-8 py-3 bg-black text-white uppercase tracking-widest text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors"
        >
          Alisverise Basla
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - logo ve sepet ikonu yok */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 md:py-5">
          <button
            onClick={() => navigate(`/${brandSlug || ""}`)}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-light uppercase tracking-wide">
              Alisverise Devam Et
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        {/* Baslik */}
        <h1 className="text-2xl md:text-3xl font-light tracking-wide text-black mb-8 md:mb-10">
          Sepetiniz
          <span className="text-gray-400 text-lg md:text-xl ml-2">
            ({totalItems} urun)
          </span>
        </h1>

        <div className="lg:grid lg:grid-cols-5 lg:gap-10">
          {/* Sol: Sepet Urunleri */}
          <div className="lg:col-span-3">
            {/* Tablo Baslik - Desktop */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 pb-3 border-b border-gray-200 mb-4">
              <span className="col-span-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Urun
              </span>
              <span className="col-span-2 text-xs font-medium text-gray-400 uppercase tracking-wider text-center">
                Fiyat
              </span>
              <span className="col-span-2 text-xs font-medium text-gray-400 uppercase tracking-wider text-center">
                Adet
              </span>
              <span className="col-span-2 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">
                Toplam
              </span>
            </div>

            {/* Urun Listesi */}
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => {
                const cartKey = getCartKey(item);
                const { unitPrice, itemTotal } =
                  cartCalculations.itemSubtotals[index];
                const displaySizeRange =
                  item.selectedVariant?.sizeRange || item.product.sizeRange;
                const displayColor = item.selectedVariant?.color;
                return (
                  <motion.div
                    key={cartKey}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-xl md:rounded-lg p-4 md:p-0 mb-3 md:mb-0 md:py-5 md:border-b md:border-gray-100 md:bg-transparent md:rounded-none"
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden">
                      <div className="flex gap-4">
                        <img
                          src={normalizeImageUrl(item.product.imageUrl)}
                          alt={item.product.title}
                          className="w-24 h-28 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-medium text-black truncate pr-2">
                              {item.product.title}
                            </p>
                            <button
                              onClick={() => removeItem(cartKey)}
                              className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-400 font-light mb-0.5">
                            Kod: {item.product.productCode}
                          </p>
                          <p className="text-xs text-gray-400 font-light">
                            Beden: {displaySizeRange}
                          </p>
                          {displayColor && (
                            <p className="text-xs text-gray-400 font-light">
                              Renk: {displayColor}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() =>
                                  updateQuantity(cartKey, item.quantity - 1)
                                }
                                className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                <Minus className="w-3 h-3 text-gray-600" />
                              </button>
                              <span className="w-10 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(cartKey, item.quantity + 1)
                                }
                                className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                <Plus className="w-3 h-3 text-gray-600" />
                              </button>
                            </div>
                            {/* Item Total */}
                            <p className="text-base font-semibold text-black">
                              {formatPrice(itemTotal)} {currency}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:items-center">
                      {/* Product Info */}
                      <div className="col-span-6 flex gap-4 items-center">
                        <img
                          src={normalizeImageUrl(item.product.imageUrl)}
                          alt={item.product.title}
                          className="w-20 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-black truncate mb-0.5">
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
                          <button
                            onClick={() => removeItem(cartKey)}
                            className="mt-1 text-xs text-gray-400 hover:text-red-500 transition-colors underline"
                          >
                            Kaldir
                          </button>
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="col-span-2 text-center">
                        <p className="text-sm text-gray-600">
                          {formatPrice(unitPrice)} {currency}
                        </p>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2 flex justify-center">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(cartKey, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(cartKey, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="col-span-2 text-right">
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

          {/* Sag: Siparis Ozeti + Form */}
          <div className="lg:col-span-2 mt-8 lg:mt-0">
            <div className="bg-white rounded-xl p-5 md:p-6 lg:sticky lg:top-6">
              <h2 className="text-lg font-medium text-black mb-5">
                Siparis Ozeti
              </h2>

              {/* Item Subtotals Summary */}
              <div className="space-y-2 mb-4">
                {items.map((item, index) => {
                  const { itemTotal } = cartCalculations.itemSubtotals[index];
                  const colorLabel = item.selectedVariant?.color
                    ? ` (${item.selectedVariant.color})`
                    : "";
                  return (
                    <div
                      key={getCartKey(item)}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-500 truncate pr-2 flex-1">
                        {item.product.productCode}
                        {colorLabel}{" "}
                        <span className="text-gray-400">x{item.quantity}</span>
                      </span>
                      <span className="text-gray-700 font-medium flex-shrink-0">
                        {formatPrice(itemTotal)} {currency}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-black">
                    Toplam
                  </span>
                  <span className="text-xl md:text-2xl font-bold text-black">
                    {formatPrice(cartCalculations.subtotal)} {currency}
                  </span>
                </div>
              </div>

              {/* Siparis Formu */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-[0.15em] mb-3">
                  Musteri Bilgileri
                </h3>
                <div className="space-y-3 mb-5">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      {...register("firstName", { required: true })}
                      placeholder="Ad"
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm font-light focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all ${
                        errors.firstName ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                    <input
                      {...register("lastName", { required: true })}
                      placeholder="Soyad"
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm font-light focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all ${
                        errors.lastName ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="px-2 py-2.5 border border-gray-200 rounded-lg text-sm font-light focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black bg-white min-w-[90px]"
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      {...register("phone", { required: true })}
                      placeholder="Telefon"
                      type="tel"
                      className={`flex-1 px-3 py-2.5 border rounded-lg text-sm font-light focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all ${
                        errors.phone ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                  </div>

                  <textarea
                    {...register("address", { required: true })}
                    placeholder="Adres"
                    rows={2}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm font-light focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all resize-none ${
                      errors.address ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={createOrder.isPending}
                  className="w-full py-3.5 bg-black text-white uppercase tracking-widest text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createOrder.isPending ? (
                    "Gonderiliyor..."
                  ) : (
                    <>
                      Siparisi Gonder
                      <span className="font-bold">
                        · {formatPrice(cartCalculations.subtotal)} {currency}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
