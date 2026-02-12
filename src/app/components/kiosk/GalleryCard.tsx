import { Product } from "../../../data/products";
import { cn } from "../ui/utils";

interface GalleryCardProps {
  product: Product;
  onClick: () => void;
  showTitle?: boolean;
  showInfo?: boolean;
  infoPosition?: "overlay" | "below";
  currency?: string;
}

export function GalleryCard({
  product,
  onClick,
  showTitle = false,
  showInfo = false,
  infoPosition = "below",
  currency = "$",
}: GalleryCardProps) {
  // Parse price to extract number (remove currency symbols)
  const priceNumber = product.price.replace(/[^0-9.,]/g, "");

  const productInfo = showInfo && (
    <div
      className={cn(
        "text-center text-xs md:text-sm leading-snug",
        infoPosition === "overlay"
          ? "absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm text-gray-800 py-2.5 px-3 rounded-lg shadow-lg border border-gray-200/50"
          : "mt-2 px-2 text-gray-700",
      )}
    >
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="font-normal">{product.productCode}</span>
        <span className="text-gray-400">•</span>
        <span className="font-normal">{product.sizeRange}</span>
        <span className="text-gray-400">•</span>
        <span className="font-semibold">
          {priceNumber}
          {currency}
        </span>
      </div>
    </div>
  );

  return (
    <div className="cursor-pointer" onClick={onClick}>
      <div className="relative w-full bg-white overflow-hidden group">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-auto object-contain"
          loading="lazy"
        />
        {infoPosition === "overlay" && productInfo}
      </div>

      {showTitle && (
        <p className="mt-3 text-sm text-gray-600 text-center font-light tracking-wide">
          {product.title}
        </p>
      )}

      {infoPosition === "below" && productInfo}
    </div>
  );
}
