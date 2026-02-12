# Kiosk QR Kiosk Catalog - File Index

Complete index of all project files and their purposes.

## 📁 Project Root

| File | Purpose |
|------|---------|
| `.gitignore` | Git ignore patterns |
| `CHANGELOG.md` | Version history and changes |
| `CONTRIBUTING.md` | Contribution guidelines |
| `CUSTOMIZATION.md` | How to customize the app |
| `FEATURES.md` | Detailed feature documentation |
| `FILE_INDEX.md` | This file - complete file reference |
| `KIOSK_SETUP.md` | Production deployment guide |
| `LICENSE.md` | MIT License |
| `PROJECT_OVERVIEW.md` | Technical architecture overview |
| `QUICKSTART.md` | 5-minute getting started guide |
| `README.md` | Main project documentation |
| `ROADMAP.md` | Future enhancement plans |
| `package.json` | Project dependencies and scripts |
| `vite.config.ts` | Vite build configuration |

## 📁 /src - Source Code

### /src/app - Application Code

| File | Purpose |
|------|---------|
| `App.tsx` | Root component with router provider |
| `routes.tsx` | React Router configuration |

### /src/app/components/kiosk - Kiosk UI Components

| File | Purpose | Type |
|------|---------|------|
| `AttractOverlay.tsx` | Idle screen with animated branding | Component |
| `FilterSheet.tsx` | Bottom sheet for filtering products | Component |
| `GalleryCard.tsx` | Individual product card | Component |
| `GalleryGrid.tsx` | Responsive product grid layout | Component |
| `GallerySkeleton.tsx` | Loading state skeleton | Component |
| `KioskButton.tsx` | Touch-optimized button | UI Primitive |
| `KioskInput.tsx` | Touch-optimized input field | UI Primitive |
| `KioskLayout.tsx` | Main layout with header/clock/language | Layout |
| `ProductDetailModal.tsx` | Product detail overlay modal | Component |
| `index.ts` | Component exports | Export |

### /src/app/pages - Page Components

| File | Purpose |
|------|---------|
| `ProductsPage.tsx` | Main gallery page with filtering |

### /src/config - Configuration

| File | Purpose |
|------|---------|
| `kiosk.config.ts` | Central configuration (idle timeout, layout, UI settings) |

### /src/contexts - React Contexts

| File | Purpose |
|------|---------|
| `I18nContext.tsx` | Internationalization context and provider |

### /src/data - Application Data

| File | Purpose |
|------|---------|
| `products.ts` | Product data (18 samples, NO PRICES) |

### /src/hooks - Custom React Hooks

| File | Purpose |
|------|---------|
| `useIdleTimer.ts` | Idle detection hook (triggers attract mode) |

### /src/i18n - Internationalization

| File | Purpose |
|------|---------|
| `translations.ts` | TR/EN translations for all UI strings |

### /src/styles - Styling

| File | Purpose |
|------|---------|
| `fonts.css` | Font imports |
| `index.css` | Global styles |
| `tailwind.css` | Tailwind CSS imports |
| `theme.css` | Design tokens and theme variables |

### /src/utils - Utility Functions

| File | Purpose |
|------|---------|
| `productHelpers.ts` | Product filtering, search, and similarity functions |

## 📊 File Statistics

**Total Files Created:** 40+

**By Category:**
- Documentation: 13 files
- Components: 10 files
- Configuration: 3 files
- Utilities: 4 files
- Styles: 4 files
- Data: 2 files
- Hooks: 1 file
- Routes: 1 file

**By Type:**
- TypeScript/TSX: 18 files
- Markdown: 13 files
- CSS: 4 files
- Config: 4 files
- Other: 1 file

## 🗂️ Directory Structure

```
Kiosk QR-kiosk/
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── CUSTOMIZATION.md
├── FEATURES.md
├── FILE_INDEX.md ← You are here
├── KIOSK_SETUP.md
├── LICENSE.md
├── PROJECT_OVERVIEW.md
├── QUICKSTART.md
├── README.md
├── ROADMAP.md
├── package.json
├── vite.config.ts
│
└── src/
    ├── app/
    │   ├── App.tsx
    │   ├── routes.tsx
    │   ├── components/
    │   │   ├── kiosk/
    │   │   │   ├── AttractOverlay.tsx
    │   │   │   ├── FilterSheet.tsx
    │   │   │   ├── GalleryCard.tsx
    │   │   │   ├── GalleryGrid.tsx
    │   │   │   ├── GallerySkeleton.tsx
    │   │   │   ├── KioskButton.tsx
    │   │   │   ├── KioskInput.tsx
    │   │   │   ├── KioskLayout.tsx
    │   │   │   ├── ProductDetailModal.tsx
    │   │   │   └── index.ts
    │   │   └── ui/
    │   │       └── [existing UI components]
    │   └── pages/
    │       └── ProductsPage.tsx
    │
    ├── config/
    │   └── kiosk.config.ts
    │
    ├── contexts/
    │   └── I18nContext.tsx
    │
    ├── data/
    │   └── products.ts
    │
    ├── hooks/
    │   └── useIdleTimer.ts
    │
    ├── i18n/
    │   └── translations.ts
    │
    ├── styles/
    │   ├── fonts.css
    │   ├── index.css
    │   ├── tailwind.css
    │   └── theme.css
    │
    └── utils/
        └── productHelpers.ts
```

## 📖 Documentation Files

### Getting Started
1. **README.md** - Start here for project overview
2. **QUICKSTART.md** - Get running in 5 minutes
3. **PROJECT_OVERVIEW.md** - Technical architecture

### Customization
4. **CUSTOMIZATION.md** - Detailed customization guide
5. **FEATURES.md** - Complete feature list
6. **kiosk.config.ts** - Configuration file

### Deployment
7. **KIOSK_SETUP.md** - Production deployment
8. **package.json** - Dependencies and scripts

### Contributing
9. **CONTRIBUTING.md** - How to contribute
10. **CHANGELOG.md** - Version history
11. **ROADMAP.md** - Future plans

### Legal
12. **LICENSE.md** - MIT License

## 🔍 Quick File Lookup

**Need to:**

- **Add products?** → `/src/data/products.ts`
- **Change brand name?** → `/src/i18n/translations.ts`
- **Adjust idle timeout?** → `/src/config/kiosk.config.ts`
- **Change colors?** → `/src/styles/theme.css`
- **Modify layout?** → `/src/app/components/kiosk/KioskLayout.tsx`
- **Update translations?** → `/src/i18n/translations.ts`
- **Configure grid?** → `/src/config/kiosk.config.ts`
- **Change routes?** → `/src/app/routes.tsx`
- **Add filters?** → `/src/utils/productHelpers.ts`

## 📝 File Naming Conventions

**Components:**
- PascalCase: `KioskButton.tsx`, `ProductsPage.tsx`
- One component per file
- Named exports preferred

**Utilities:**
- camelCase: `productHelpers.ts`, `useIdleTimer.ts`
- Descriptive names

**Configs:**
- kebab-case or dot notation: `kiosk.config.ts`, `vite.config.ts`

**Documentation:**
- SCREAMING_SNAKE_CASE: `README.md`, `QUICKSTART.md`
- Descriptive names

**Styles:**
- kebab-case: `theme.css`, `tailwind.css`

## 🏷️ File Tags

**Critical Files (Do Not Delete):**
- `App.tsx`
- `routes.tsx`
- `products.ts`
- `translations.ts`
- `theme.css`
- `package.json`

**Configuration Files (Customize These):**
- `kiosk.config.ts`
- `products.ts`
- `translations.ts`
- `theme.css`

**Documentation Files (Reference):**
- All `.md` files in root

**Component Files (Reusable):**
- All files in `/src/app/components/kiosk/`

## 📦 Dependencies Overview

**Production Dependencies:**
- React ecosystem: react, react-router
- Styling: tailwindcss
- Animation: motion
- Icons: lucide-react
- Utilities: clsx, tailwind-merge

**Dev Dependencies:**
- Build: vite, @vitejs/plugin-react
- Tooling: @tailwindcss/vite, typescript

See `package.json` for complete list with versions.

## 🔄 Auto-Generated Files (Git Ignored)

- `node_modules/` - Dependencies
- `dist/` - Production build
- `.env.local` - Local environment variables
- `*.log` - Log files

---

**Last Updated:** February 10, 2026  
**Total Files:** 40+  
**Lines of Code:** ~3,500+  
**Documentation:** ~5,000+ words
