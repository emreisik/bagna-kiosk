# Changelog

All notable changes to the Kiosk QR Kiosk Catalog project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-10

### 🎉 Initial Release

**Core Features:**
- Full-screen kiosk interface optimized for touch screens
- Minimal black and white premium design aesthetic
- 18 curated sample products (furniture, lighting, decor)
- Responsive product gallery with 2-6 column layout
- Product detail modal with large imagery
- Advanced filtering by category, tags, and search
- Similar products recommendation system
- Bilingual support (Turkish default, English toggle)
- Idle attract mode after 45 seconds of inactivity
- Real-time clock display in header
- Language switcher (TR/EN)

**Components Implemented:**
- `KioskLayout` - Main layout wrapper with header
- `ProductsPage` - Gallery page with filtering
- `GalleryGrid` - Responsive product grid
- `GalleryCard` - Product card with hover effects
- `GallerySkeleton` - Loading state skeleton
- `FilterSheet` - Bottom sheet modal for filters
- `ProductDetailModal` - Product detail overlay
- `AttractOverlay` - Idle screen with animations
- `KioskButton` - Touch-optimized button component
- `KioskInput` - Touch-optimized input component

**Utilities & Helpers:**
- `useIdleTimer` - Hook for idle detection
- `I18nProvider` - Internationalization context
- `productHelpers` - Product filtering and search utilities
- `kioskConfig` - Centralized configuration

**Documentation:**
- README.md - Comprehensive project documentation
- QUICKSTART.md - 5-minute getting started guide
- CUSTOMIZATION.md - Detailed customization instructions
- FEATURES.md - Complete feature overview
- KIOSK_SETUP.md - Production deployment guide
- ROADMAP.md - Future enhancement plans
- PROJECT_OVERVIEW.md - Technical architecture overview

**Technical Stack:**
- React 18.3.1
- TypeScript (latest)
- Tailwind CSS 4.1.12
- React Router 7.13.0
- Motion 12.23.24 (Framer Motion successor)
- Lucide React 0.487.0
- Vite 6.3.5

**Design System:**
- 18px base font size (kiosk-optimized)
- 52px minimum touch target height
- Black (#000) and white (#FFF) color scheme
- Light to extra-light font weights
- Wide letter spacing for premium feel
- Responsive grid with 32px gaps

**Performance:**
- Lazy image loading
- Memoized filter calculations
- Optimized re-renders
- Smooth 60fps animations
- Fast page loads (<2s target)

**Accessibility:**
- Large touch targets (52px+)
- High contrast design
- Keyboard navigation support
- Semantic HTML structure
- Alt text for images

**Browser Support:**
- Chrome/Edge 90+
- Safari 14+
- Firefox 88+

### 📝 Notes

This is the initial production-ready release of Kiosk QR Kiosk Catalog. The application is fully functional and ready for deployment to touch-screen kiosks.

**What's NOT Included (By Design):**
- Pricing information (catalog-only focus)
- Shopping cart functionality
- User authentication
- Payment processing
- Inventory management
- Backend/database integration
- CMS integration

These features are intentionally excluded to maintain the minimal catalog experience. See ROADMAP.md for potential future enhancements.

### 🔧 Configuration

All major settings are configurable via `/src/config/kiosk.config.ts`:
- Idle timeout duration
- Default language
- Grid layout columns
- Touch target sizes
- Brand information
- Animation settings

### 🌍 Internationalization

Full support for:
- Turkish (TR) - Default
- English (EN)

All UI strings, categories, and tags are translatable. Easy to extend to additional languages.

### 📦 Installation

```bash
pnpm install
pnpm run dev
```

### 🚀 Deployment

Supports multiple deployment options:
- Static hosting (Netlify, Vercel)
- Self-hosted (Nginx, Apache)
- Docker containers
- Chromium kiosk mode

See KIOSK_SETUP.md for detailed deployment instructions.

### 🐛 Known Issues

None reported at initial release.

### 🙏 Acknowledgments

- Unsplash for product imagery
- Lucide for icon library
- Tailwind Labs for CSS framework
- Vercel for Motion animation library

---

## Future Releases

See [ROADMAP.md](ROADMAP.md) for planned features and enhancements.

**Planned for v1.1:**
- Voice search capability
- QR code generation
- Product comparison mode
- PWA support
- Enhanced analytics

**Planned for v1.2:**
- Admin panel
- Content management
- Bulk import
- Advanced analytics

**Planned for v2.0:**
- Backend integration
- CMS integration
- Additional languages
- Advanced accessibility

---

[1.0.0]: https://github.com/yourusername/Kiosk QR-kiosk/releases/tag/v1.0.0
