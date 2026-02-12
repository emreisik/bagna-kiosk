import { Product } from "../../../data/products";
import { GalleryCard } from "./GalleryCard";

interface GalleryGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  showTitles?: boolean;
  showInfo?: boolean;
  infoPosition?: "overlay" | "below";
  currency?: string;
  columnsMobile?: number;
  columnsTablet?: number;
  columnsDesktop?: number;
  columnsKiosk?: number;
}

export function GalleryGrid({
  products,
  onProductClick,
  showTitles = false,
  showInfo = false,
  infoPosition = "below",
  currency = "$",
  columnsMobile = 2,
  columnsTablet = 2,
  columnsDesktop = 3,
  columnsKiosk = 3,
}: GalleryGridProps) {
  // Mobile (< 768px)
  const mobileClass =
    columnsMobile === 1
      ? "grid-cols-1"
      : columnsMobile === 3
        ? "grid-cols-3"
        : columnsMobile === 4
          ? "grid-cols-4"
          : "grid-cols-2";

  // Tablet (768px - 1024px)
  const tabletClass =
    columnsTablet === 1
      ? "md:grid-cols-1"
      : columnsTablet === 3
        ? "md:grid-cols-3"
        : columnsTablet === 4
          ? "md:grid-cols-4"
          : "md:grid-cols-2";

  // Desktop (1024px - 1536px)
  const desktopClass =
    columnsDesktop === 1
      ? "lg:grid-cols-1"
      : columnsDesktop === 2
        ? "lg:grid-cols-2"
        : columnsDesktop === 4
          ? "lg:grid-cols-4"
          : "lg:grid-cols-3";

  // Kiosk (>= 1536px)
  const kioskClass =
    columnsKiosk === 1
      ? "2xl:grid-cols-1"
      : columnsKiosk === 2
        ? "2xl:grid-cols-2"
        : columnsKiosk === 4
          ? "2xl:grid-cols-4"
          : "2xl:grid-cols-3";

  const finalClassName = `grid ${mobileClass} ${tabletClass} ${desktopClass} ${kioskClass} gap-2 md:gap-3 lg:gap-4`;

  console.log("🎨 GalleryGrid Classes:", {
    mobile: columnsMobile,
    tablet: columnsTablet,
    desktop: columnsDesktop,
    kiosk: columnsKiosk,
    className: finalClassName,
  });

  return (
    <div className={finalClassName}>
      {products.map((product) => (
        <GalleryCard
          key={product.id}
          product={product}
          onClick={() => onProductClick(product)}
          showTitle={showTitles}
          showInfo={showInfo}
          infoPosition={infoPosition}
          currency={currency}
        />
      ))}
    </div>
  );
}
