/**
 * Kiosk QR Kiosk Configuration
 * 
 * Centralized configuration for easy customization
 */

export const kioskConfig = {
  // Brand Information
  brand: {
    name: 'Kiosk QR',
    sloganEn: 'Minimal Catalog Experience',
    sloganTr: 'Minimal Katalog Deneyimi',
    sloganRu: 'Минимальный Каталог',
  },

  // Behavior Settings
  behavior: {
    idleTimeoutMs: 30000, // 30 seconds
    defaultLanguage: 'tr' as 'tr' | 'en' | 'ru',
    showProductTitles: false,
    enableAttractMode: true,
  },

  // Layout Settings
  layout: {
    headerHeight: '80px',
    gridGaps: {
      mobile: 'gap-6',
      tablet: 'gap-8',
      desktop: 'gap-8',
    },
    gridColumns: {
      mobile: 'grid-cols-2',
      tablet: 'md:grid-cols-3',
      desktop: 'lg:grid-cols-4',
      large: 'xl:grid-cols-5',
      xlarge: '2xl:grid-cols-6',
    },
  },

  // UI Settings
  ui: {
    minTouchTargetHeight: '52px',
    baseFontSize: '18px',
    buttonHeight: {
      default: 'h-12',
      large: 'h-16',
      touch: 'h-14',
    },
    inputHeight: 'h-14',
    borderRadius: 'rounded-sm',
    transitionDuration: 'duration-200',
  },

  // Product Card Settings
  productCard: {
    aspectRatio: 'aspect-[3/4]',
    hoverScale: 1.02,
    tapScale: 0.98,
    imageTransitionDuration: 'duration-500',
    showOverlayOnHover: true,
  },

  // Filter Settings
  filter: {
    maxVisibleFilters: 10,
    sheetMaxHeight: 'max-h-[80vh]',
    enableSearch: true,
    enableCategoryFilter: true,
    enableTagFilter: true,
  },

  // Modal Settings
  modal: {
    backdropBlur: 'backdrop-blur-sm',
    maxWidth: 'max-w-6xl',
    padding: 'p-12',
    similarProductsCount: 6,
  },

  // Performance Settings
  performance: {
    lazyLoadImages: true,
    imageQuality: 80,
    debounceSearchMs: 300,
  },

  // Attract Mode Settings
  attractMode: {
    animationDuration: 8000, // 8 seconds per cycle
    gradientOpacity: 0.3,
    textAnimationDelay: 200,
    pulseAnimationDuration: 2000,
  },
} as const;

export type KioskConfig = typeof kioskConfig;