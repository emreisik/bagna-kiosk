import { Product } from "../../../data/products";
import { cn } from "../ui/utils";
import { normalizeImageUrl } from "../../../utils/imageUrl";
import { getSizeCount } from "../../../utils/productHelpers";
import { useI18n } from "../../../contexts/I18nContext";

interface GalleryCardProps {
  product: Product;
  onClick: () => void;
  showTitle?: boolean;
  showInfoMobile?: boolean;
  infoPositionMobile?: "overlay" | "below";
  showInfoDesktop?: boolean;
  infoPositionDesktop?: "overlay" | "below";
  currency?: string;
}

export function GalleryCard({
  product,
  onClick,
  showTitle = false,
  showInfoMobile = false,
  infoPositionMobile = "below",
  showInfoDesktop = false,
  infoPositionDesktop = "below",
  currency = "$",
}: GalleryCardProps) {
  const { t } = useI18n();
  // Birim fiyat gosterilir - seri toplam sadece sepette hesaplanir
  const priceNumber = product.price.replace(/[^0-9.,]/g, "");
  const sizeCount = getSizeCount(product.sizeRange);

  // Bilgi icerigi — tekrar etmemek icin fonksiyon
  const renderInfo = (
    position: "overlay" | "below",
    visibilityClass: string,
  ) => (
    <div
      className={cn(
        "text-center text-xs md:text-sm leading-snug",
        visibilityClass,
        position === "overlay"
          ? "absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm text-gray-800 py-2.5 px-3 rounded-lg shadow-lg border border-gray-200/50"
          : "mt-2 px-2 text-gray-700",
      )}
    >
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="font-normal">{product.productCode}</span>
        <span className="text-gray-400">&bull;</span>
        <span className="font-normal">{product.sizeRange}</span>
        {sizeCount > 1 && (
          <>
            <span className="text-gray-400">&bull;</span>
            <span className="inline-flex items-center text-[10px] font-semibold bg-black text-white px-1.5 py-0.5 rounded">
              {t("seriesPcs").replace("{count}", String(sizeCount))}
            </span>
          </>
        )}
        <span className="text-gray-400">&bull;</span>
        <span className="font-semibold">
          {priceNumber}
          {currency}
        </span>
      </div>
    </div>
  );

  // Overlay bloklari (gorsel icerisinde render edilir)
  const mobileOverlay =
    showInfoMobile && infoPositionMobile === "overlay"
      ? renderInfo("overlay", "md:hidden")
      : null;
  const desktopOverlay =
    showInfoDesktop && infoPositionDesktop === "overlay"
      ? renderInfo("overlay", "hidden md:block")
      : null;

  // Below bloklari (gorsel disinda render edilir)
  const mobileBelow =
    showInfoMobile && infoPositionMobile === "below"
      ? renderInfo("below", "md:hidden")
      : null;
  const desktopBelow =
    showInfoDesktop && infoPositionDesktop === "below"
      ? renderInfo("below", "hidden md:block")
      : null;

  return (
    <div className="cursor-pointer" onClick={onClick}>
      <div className="relative w-full bg-white overflow-hidden group">
        <img
          src={normalizeImageUrl(product.imageUrl)}
          alt={product.title}
          className="w-full h-auto object-contain"
          loading="lazy"
        />
        {mobileOverlay}
        {desktopOverlay}
      </div>

      {showTitle && (
        <p className="mt-3 text-sm text-gray-600 text-center font-light tracking-wide">
          {product.title}
        </p>
      )}

      {mobileBelow}
      {desktopBelow}
    </div>
  );
}
