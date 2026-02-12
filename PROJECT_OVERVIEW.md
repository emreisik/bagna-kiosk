# Kiosk QR Kiosk Catalog - Project Overview

## Executive Summary

Kiosk QR is a full-screen kiosk catalog web application designed for touch-screen displays. It showcases products in a minimal, premium aesthetic with no pricing information—perfect for showrooms, galleries, and brand experiences.

**Key Highlights:**
- ✨ Touch-first interface optimized for kiosks
- 🎨 Minimal black & white design
- 🌍 Bilingual support (Turkish/English)
- ⚡ Fast, responsive, and smooth
- 📱 Responsive across all screen sizes
- 🔄 Auto-attract mode after inactivity

## Project Structure

```
Kiosk QR-kiosk/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── kiosk/          # Main kiosk components
│   │   │   │   ├── AttractOverlay.tsx
│   │   │   │   ├── FilterSheet.tsx
│   │   │   │   ├── GalleryCard.tsx
│   │   │   │   ├── GalleryGrid.tsx
│   │   │   │   ├── GallerySkeleton.tsx
│   │   │   │   ├── KioskButton.tsx
│   │   │   │   ├── KioskInput.tsx
│   │   │   │   ├── KioskLayout.tsx
│   │   │   │   ├── ProductDetailModal.tsx
│   │   │   │   └── index.ts
│   │   │   └── ui/             # Base UI components
│   │   ├── pages/
│   │   │   └── ProductsPage.tsx
│   │   ├── App.tsx             # Root component
│   │   └── routes.tsx          # Routing config
│   ├── config/
│   │   └── kiosk.config.ts     # Central configuration
│   ├── contexts/
│   │   └── I18nContext.tsx     # Internationalization
│   ├── data/
│   │   └── products.ts         # Product data (NO PRICES)
│   ├── hooks/
│   │   └── useIdleTimer.ts     # Idle detection
│   ├── i18n/
│   │   └── translations.ts     # TR/EN translations
│   ├── styles/
│   │   ├── fonts.css
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   └── theme.css
│   └── utils/
│       └── productHelpers.ts   # Product utilities
├── CUSTOMIZATION.md            # Customization guide
├── FEATURES.md                 # Feature documentation
├── KIOSK_SETUP.md             # Deployment guide
├── QUICKSTART.md              # Quick start guide
├── README.md                  # Main documentation
├── ROADMAP.md                 # Future plans
├── package.json
└── vite.config.ts
```

## Core Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | Latest | Type safety |
| Tailwind CSS | 4.1.12 | Styling |
| React Router | 7.13.0 | Routing |
| Motion | 12.23.24 | Animations |
| Lucide React | 0.487.0 | Icons |
| Vite | 6.3.5 | Build tool |

## Key Features

### 1. Product Gallery
- Image-focused product cards
- Responsive grid (2-6 columns)
- Lazy loading for performance
- Hover/tap animations
- Optional title display

### 2. Advanced Filtering
- Category filter (single selection)
- Tag filter (multi-selection)
- Real-time search
- Combined filter logic (AND)
- Active filter count badge

### 3. Product Details
- Large product image
- Description and tags
- Similar products (based on category/tags)
- Smooth modal transitions
- Touch-friendly navigation

### 4. Kiosk Features
- **Idle Mode:** Attract screen after 45s
- **Language Toggle:** TR/EN switching
- **Real-time Clock:** Always visible
- **Full Screen:** Optimized for kiosks
- **Touch Optimized:** 52px+ touch targets

### 5. Internationalization
- Turkish (default)
- English
- Context-based translations
- Easy to extend

## Data Structure

### Product Interface
```typescript
interface Product {
  id: string;          // Unique identifier
  title: string;       // Product name
  imageUrl: string;    // High-quality image URL
  category: string;    // furniture | lighting | decor
  tags: string[];      // Descriptive tags
  shortDesc: string;   // Brief description
}
```

**Intentionally Excluded:**
- ❌ Price/currency
- ❌ Stock/inventory
- ❌ Ratings/reviews
- ❌ SKU/variants
- ❌ Discounts/sales

### Configuration Structure
```typescript
kioskConfig = {
  brand: { name, sloganEn, sloganTr },
  behavior: { idleTimeoutMs, defaultLanguage, showProductTitles },
  layout: { headerHeight, gridGaps, gridColumns },
  ui: { minTouchTargetHeight, baseFontSize, buttonHeight },
  productCard: { aspectRatio, hoverScale, tapScale },
  filter: { maxVisibleFilters, enableSearch, enableCategoryFilter },
  modal: { maxWidth, padding, similarProductsCount },
  performance: { lazyLoadImages, imageQuality },
  attractMode: { animationDuration, gradientOpacity }
}
```

## User Flow

```
Start → /products (Gallery Page)
  ↓
[Browse Products]
  ↓
[Tap Product] → Product Detail Modal
  ↓                    ↓
[View Details]    [Tap Similar Product]
  ↓                    ↓
[Back to Gallery] ← [Update Modal]
  ↓
[Open Filters] → Filter Sheet
  ↓
[Select Category/Tags/Search]
  ↓
[Apply Filters]
  ↓
[Return to Gallery] → Filtered Results
  ↓
[Wait 45s] → Attract Mode
  ↓
[Tap Screen] → Return to Gallery
```

## Component Architecture

### Layout Components
- **KioskLayout** - Main app wrapper with header
  - Brand logo/name
  - Real-time clock
  - Language toggle

### Page Components
- **ProductsPage** - Main gallery view
  - Filter controls
  - Product grid
  - Product count
  - Modal/overlay management

### UI Components
- **KioskButton** - Touch-optimized button
- **KioskInput** - Touch-optimized input
- **GalleryGrid** - Responsive product grid
- **GalleryCard** - Individual product card
- **GallerySkeleton** - Loading state
- **FilterSheet** - Bottom sheet for filters
- **ProductDetailModal** - Product detail overlay
- **AttractOverlay** - Idle screen

### Utility Components
- **I18nProvider** - Translation context
- **useIdleTimer** - Idle detection hook

## State Management

**Local State (useState):**
- Filter selections (category, tags, search)
- Modal open/close
- Selected product
- Idle state

**Context State:**
- Language preference (I18nContext)

**No External State Management:**
- All state is local to components
- No Redux, Zustand, or similar needed
- Simple and maintainable

## Routing

```typescript
Routes:
  /          → Redirect to /products
  /products  → ProductsPage (main gallery)
  /*         → Redirect to /products (catch-all)
```

**Navigation:**
- No traditional page navigation
- Modal-based detail views
- Single-page application (SPA)
- Browser back button works with modals

## Styling Approach

### Tailwind CSS v4
- Utility-first CSS framework
- Custom theme tokens in `theme.css`
- Responsive breakpoints
- Custom color system

### Design Tokens
```css
--font-size: 18px (kiosk-optimized)
--background: #ffffff (white)
--foreground: #000000 (black)
--border: rgba(0, 0, 0, 0.1)
```

### Responsive Breakpoints
- `sm:` 640px
- `md:` 768px (tablet)
- `lg:` 1024px (desktop)
- `xl:` 1280px
- `2xl:` 1536px (large displays)

## Performance Optimizations

1. **Lazy Loading Images**
   - Images load as they enter viewport
   - Reduces initial page load

2. **Memoized Filtering**
   - `useMemo` for expensive filters
   - Only recalculates when dependencies change

3. **Optimized Re-renders**
   - Proper React key usage
   - Minimal state updates

4. **Code Splitting**
   - Dynamic imports ready
   - Separate chunks for better caching

5. **Asset Optimization**
   - Recommended WebP images
   - CDN delivery
   - Compression

## Browser Support

**Recommended:**
- Chrome/Edge 90+
- Safari 14+
- Firefox 88+

**Required Features:**
- CSS Grid Layout ✓
- CSS Custom Properties ✓
- ES2020 JavaScript ✓
- Touch Events API ✓
- Intersection Observer ✓

## Deployment Options

1. **Static Hosting**
   - Netlify, Vercel, GitHub Pages
   - Zero configuration
   - Free tier available

2. **Self-Hosted**
   - Nginx, Apache
   - Full control
   - Custom domain

3. **Docker**
   - Containerized deployment
   - Consistent environments
   - Easy scaling

4. **Kiosk Mode**
   - Chromium kiosk mode
   - Auto-start on boot
   - Lockdown features

## Security Considerations

**No Sensitive Data:**
- No user authentication
- No payment processing
- No personal information
- Public product catalog only

**Content Security:**
- CORS for external images
- HTTPS recommended
- Input sanitization
- XSS protection (React default)

## Accessibility

**Current Support:**
- Keyboard navigation
- Focus management
- Semantic HTML
- Alt text for images

**Future Enhancements:**
- WCAG 2.1 AA compliance
- Screen reader optimization
- High contrast mode
- Adjustable font sizes

## Testing Strategy

**Manual Testing:**
- Touch device testing
- Cross-browser testing
- Responsive testing
- Idle mode testing

**Recommended Automated Testing:**
- Unit tests (Vitest)
- Component tests (React Testing Library)
- E2E tests (Playwright)
- Visual regression (Chromatic)

## Monitoring & Analytics

**Not Included (Add as needed):**
- Google Analytics
- Custom event tracking
- Error monitoring (Sentry)
- Performance monitoring
- User behavior analytics

## Customization Points

**Easy to Customize:**
- ✅ Brand name/logo
- ✅ Product data
- ✅ Categories/tags
- ✅ Translations
- ✅ Colors/theme
- ✅ Idle timeout
- ✅ Grid layout

**Requires Code Changes:**
- Additional languages
- New filter types
- Custom animations
- Backend integration
- Payment features

## Best Practices Implemented

- ✅ Component composition
- ✅ Custom hooks for reusability
- ✅ TypeScript for type safety
- ✅ Centralized configuration
- ✅ Separation of concerns
- ✅ Utility functions
- ✅ Responsive design
- ✅ Performance optimization
- ✅ Accessibility basics
- ✅ Clean code structure

## Known Limitations

1. **Client-Side Only**
   - No backend/database
   - Products in static file
   - No real-time updates

2. **No Authentication**
   - Public catalog only
   - No user accounts
   - No personalization

3. **Limited Analytics**
   - No built-in tracking
   - Requires external tools

4. **Image Hosting**
   - External URLs only
   - No upload functionality
   - CDN recommended

## Migration Path

**To Add Backend:**
1. Create API endpoints
2. Replace static data with API calls
3. Add loading states
4. Handle errors
5. Implement caching

**To Add CMS:**
1. Choose CMS (Contentful, Strapi)
2. Create content models
3. Integrate API
4. Add content management UI
5. Set up webhooks

## Support & Maintenance

**Documentation:**
- README.md - Main docs
- QUICKSTART.md - Getting started
- CUSTOMIZATION.md - How to customize
- FEATURES.md - Feature list
- KIOSK_SETUP.md - Deployment
- ROADMAP.md - Future plans

**Version Control:**
- Git for source control
- Semantic versioning
- Change log
- Release notes

---

**Project Status:** Production Ready  
**Version:** 1.0.0  
**Last Updated:** February 10, 2026  
**License:** As specified in project  
**Maintained By:** Development Team
