# Kiosk QR - Minimal Kiosk Catalog

A full-screen kiosk catalog web application built with React, TypeScript, and Tailwind CSS. Designed for touch-screen displays with a premium minimal aesthetic.

> **Note:** This project is built with React + Vite (not Next.js) and uses React Router for routing, adapted for the Figma Make environment.

## Features

### Kiosk-Optimized UI
- **Full-screen experience** optimized for 16:9 displays
- **Touch-first interactions** with large touch targets (min 52px)
- **Minimal black & white design** with premium aesthetics
- **Responsive grid** that adapts from 2 to 6 columns based on screen size

### Product Catalog
- **Image-focused gallery** showing products without prices
- **Advanced filtering** by category, tags, and search
- **Product details modal** with large imagery and descriptions
- **Similar products** recommendation based on category and tags
- **18 curated products** across furniture, lighting, and decor categories

### Kiosk Features
- **Idle attract mode** - After 45 seconds of inactivity, displays animated brand screen
- **Real-time clock** in header
- **Bilingual support** - Turkish (default) and English with easy toggle
- **Filter sheet** - Bottom sheet modal for touch-friendly filtering
- **Smooth animations** using Motion (formerly Framer Motion)

### Internationalization
- **Turkish** (default) and **English** languages
- **Context-based translations** for all UI elements
- **Localized categories and tags**

## Project Structure

```
/src
  /app
    /components
      /kiosk
        AttractOverlay.tsx      # Idle screen overlay
        FilterSheet.tsx         # Bottom sheet for filters
        GalleryCard.tsx         # Product card component
        GalleryGrid.tsx         # Product grid layout
        KioskButton.tsx         # Touch-optimized button
        KioskInput.tsx          # Touch-optimized input
        KioskLayout.tsx         # Main layout with header
        ProductDetailModal.tsx  # Product detail view
    /pages
      ProductsPage.tsx          # Main products gallery page
    routes.tsx                  # React Router configuration
    App.tsx                     # App root with providers
  /contexts
    I18nContext.tsx             # Internationalization context
  /data
    products.ts                 # Mock product data (NO PRICES)
  /hooks
    useIdleTimer.ts             # Idle detection hook
  /i18n
    translations.ts             # TR/EN translations
  /styles
    theme.css                   # Design tokens and base styles
```

## Installation

```bash
# Install dependencies (this project uses pnpm)
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build
```

## Usage

### Routes
- `/` - Auto-redirects to `/products`
- `/products` - Main gallery page (primary kiosk screen)
- All other routes redirect to `/products`

### Product Data Structure

```typescript
interface Product {
  id: string;
  title: string;
  imageUrl: string;
  category: string;      // furniture | lighting | decor
  tags: string[];        // modern, seating, minimalist, etc.
  shortDesc: string;
}
```

**Note:** The product data structure intentionally excludes price, currency, stock, and other commercial fields to focus on visual catalog presentation.

### Customization

#### Adding Products
Edit `/src/data/products.ts`:

```typescript
export const products: Product[] = [
  {
    id: "unique-id",
    title: "Product Name",
    imageUrl: "https://...",
    category: "furniture", // or "lighting" or "decor"
    tags: ["modern", "seating"],
    shortDesc: "Product description"
  },
  // ... more products
];
```

#### Modifying Translations
Edit `/src/i18n/translations.ts`:

```typescript
export const translations = {
  en: {
    brand: "Kiosk QR",
    slogan: "Minimal Catalog Experience",
    // ... more translations
  },
  tr: {
    brand: "Kiosk QR",
    slogan: "Minimal Katalog Deneyimi",
    // ... more translations
  }
};
```

#### Adjusting Idle Timer
Default is 45 seconds. Change in `/src/app/pages/ProductsPage.tsx`:

```typescript
const isIdle = useIdleTimer(45000); // milliseconds
```

#### Showing Product Titles
Product titles are hidden by default. To show them:

```typescript
<GalleryGrid
  products={filteredProducts}
  onProductClick={handleProductClick}
  showTitles={true}  // Change to true
/>
```

## Design System

### Colors
- **Primary:** Black (#000000)
- **Secondary:** White (#FFFFFF)
- **Accent:** Gray tones for subtle UI elements
- **Background:** Pure white for maximum contrast

### Typography
- **Base font size:** 18px (optimized for kiosk viewing)
- **Headings:** Light to extra-light weights
- **Body text:** Regular weight
- **Letter spacing:** Wide tracking for premium feel

### Spacing
- **Grid gaps:** 32px (8 in Tailwind)
- **Touch targets:** Minimum 52px height
- **Padding:** Generous whitespace throughout
- **Container max-width:** 2000px for large displays

### Components
All kiosk components use:
- Rounded corners (rounded-sm)
- Smooth transitions (200-300ms)
- Active states with scale transforms
- High contrast for readability

## Technologies

- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4.1** - Utility-first styling
- **React Router 7.13** - Client-side routing
- **Motion** (Framer Motion successor) - Animations
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server

## Browser Support

Optimized for modern browsers:
- Chrome/Edge 90+
- Safari 14+
- Firefox 88+

Recommended for touch-enabled kiosk displays running Chromium-based browsers in kiosk mode.

## Kiosk Deployment

### Running in Kiosk Mode

**Chrome/Chromium:**
```bash
chromium-browser --kiosk --app=http://localhost:5173
```

**Production:**
```bash
chromium-browser --kiosk --app=https://yourdomain.com/products
```

### Recommended Kiosk Settings
- Disable right-click context menu
- Disable browser shortcuts (F11, Ctrl+W, etc.)
- Enable touch events
- Set auto-reload on crash
- Disable screensaver
- Set display to never sleep

## License

This project is provided as-is for demonstration purposes.

---

**Brand:** Kiosk QR  
**Tagline:** Minimal Catalog Experience