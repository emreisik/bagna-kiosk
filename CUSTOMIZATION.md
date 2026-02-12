# Customization Guide

This guide shows you how to customize the Kiosk QR kiosk catalog for your brand and products.

## Quick Start Customization

### 1. Change Brand Name and Slogan

Edit `/src/config/kiosk.config.ts`:

```typescript
export const kioskConfig = {
  brand: {
    name: 'YOUR_BRAND',  // ← Change this
    sloganEn: 'Your Tagline Here',  // ← And this
    sloganTr: 'Sizin Sloganınız',   // ← Turkish version
  },
  // ... rest of config
};
```

### 2. Add Your Products

Edit `/src/data/products.ts`:

```typescript
export const products: Product[] = [
  {
    id: "unique-id-1",  // Must be unique
    title: "Product Name",
    imageUrl: "https://your-cdn.com/image.jpg",  // High-quality image URL
    category: "furniture",  // furniture | lighting | decor
    tags: ["modern", "minimalist"],  // Add relevant tags
    shortDesc: "Brief description of the product"
  },
  // Add more products...
];
```

**Product Image Guidelines:**
- Format: WebP or JPEG
- Size: 800-1200px width
- Aspect ratio: 3:4 (portrait) recommended
- File size: <200KB for optimal loading
- Quality: 80% compression

### 3. Customize Categories

If you want different categories than `furniture`, `lighting`, `decor`:

**Step 1:** Update product data (`/src/data/products.ts`):
```typescript
{
  id: "1",
  title: "Product",
  category: "electronics",  // New category
  // ...
}
```

**Step 2:** Add translations (`/src/i18n/translations.ts`):
```typescript
export const translations = {
  en: {
    // ...
    categories: {
      electronics: "Electronics",
      clothing: "Clothing",
      accessories: "Accessories",
    }
  },
  tr: {
    // ...
    categories: {
      electronics: "Elektronik",
      clothing: "Giyim",
      accessories: "Aksesuar",
    }
  }
};
```

### 4. Customize Tags

Same process as categories:

**Add new tags to products:**
```typescript
tags: ["premium", "bestseller", "new-arrival"]
```

**Add translations:**
```typescript
tags: {
  premium: "Premium",
  bestseller: "Best Seller",
  "new-arrival": "New Arrival",
}
```

### 5. Adjust Idle Timeout

Default is 45 seconds. Change in `/src/config/kiosk.config.ts`:

```typescript
behavior: {
  idleTimeoutMs: 60000,  // 60 seconds (or any value in milliseconds)
}
```

Set to `0` to disable attract mode entirely (not recommended for kiosks).

### 6. Show/Hide Product Titles

In `/src/config/kiosk.config.ts`:

```typescript
behavior: {
  showProductTitles: true,  // false = hide, true = show
}
```

Then update `/src/app/pages/ProductsPage.tsx`:

```typescript
<GalleryGrid
  products={filteredProducts}
  onProductClick={handleProductClick}
  showTitles={kioskConfig.behavior.showProductTitles}  // Use config value
/>
```

## Advanced Customization

### Color Scheme

Edit `/src/styles/theme.css`:

```css
:root {
  --background: #ffffff;    /* Main background color */
  --foreground: #000000;    /* Main text color */
  --primary: #030213;       /* Primary button background */
  --border: rgba(0, 0, 0, 0.1);  /* Border color */
  /* Add custom colors */
  --brand-color: #1a73e8;
}
```

Use in components:
```typescript
<div className="bg-[--brand-color]">...</div>
```

### Typography

**Change base font size** (affects entire app):
```css
:root {
  --font-size: 20px;  /* Default is 18px */
}
```

**Add custom fonts:**

1. Add font import to `/src/styles/fonts.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');
```

2. Update body font in `/src/styles/theme.css`:
```css
body {
  font-family: 'Inter', sans-serif;
}
```

### Grid Layout

**Adjust column counts** in `/src/config/kiosk.config.ts`:

```typescript
layout: {
  gridColumns: {
    mobile: 'grid-cols-2',      // 2 columns on mobile
    tablet: 'md:grid-cols-4',   // 4 columns on tablet
    desktop: 'lg:grid-cols-5',  // 5 columns on desktop
    large: 'xl:grid-cols-6',    // 6 columns on large screens
    xlarge: '2xl:grid-cols-8',  // 8 columns on extra large
  },
}
```

**Adjust gaps:**
```typescript
layout: {
  gridGaps: {
    mobile: 'gap-4',   // Smaller gaps on mobile
    tablet: 'gap-6',   // Medium gaps on tablet
    desktop: 'gap-8',  // Larger gaps on desktop
  },
}
```

### Button Styling

Edit `/src/app/components/kiosk/KioskButton.tsx`:

```typescript
// Change colors
{
  'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
  'bg-white text-blue-600 border-2 border-blue-600': variant === 'secondary',
}

// Change border radius
'rounded-lg'  // instead of 'rounded-sm'

// Change font
'font-bold'  // instead of 'font-medium'
```

### Modal Layout

**Change modal size** in `/src/app/components/kiosk/ProductDetailModal.tsx`:

```typescript
className="fixed inset-12 md:inset-24"  // Larger margins
```

**Change image aspect ratio:**
```typescript
<div className="aspect-square">  // Square instead of 3:4
```

### Filter Sheet Position

**Change to side sheet** instead of bottom sheet:

In `/src/app/components/kiosk/FilterSheet.tsx`:

```typescript
// Change animation
initial={{ x: '100%' }}  // Slide from right
animate={{ x: 0 }}
exit={{ x: '100%' }}

// Change position
className="fixed top-0 right-0 bottom-0 w-96"  // Right side
```

### Language Settings

**Change default language** in `/src/config/kiosk.config.ts`:

```typescript
behavior: {
  defaultLanguage: 'en',  // or 'tr'
}
```

Then update `/src/contexts/I18nContext.tsx`:

```typescript
const [language, setLanguage] = useState<Language>(kioskConfig.behavior.defaultLanguage);
```

**Add more languages:**

1. Add to `/src/i18n/translations.ts`:
```typescript
export const translations = {
  en: { /* ... */ },
  tr: { /* ... */ },
  de: {
    brand: "Kiosk QR",
    slogan: "Minimale Katalog Erfahrung",
    // ... all other keys
  }
};

export type Language = 'en' | 'tr' | 'de';
```

2. Update language toggle in `/src/app/components/kiosk/KioskLayout.tsx`

### Animation Settings

**Disable animations** (for better performance on low-end hardware):

In component files, replace `motion.div` with regular `div`:

```typescript
// Before
<motion.div whileHover={{ scale: 1.02 }}>

// After
<div>
```

**Adjust animation speeds** in `/src/config/kiosk.config.ts`:

```typescript
attractMode: {
  animationDuration: 6000,  // Faster attract mode
  pulseAnimationDuration: 1500,  // Faster pulse
}
```

### Logo Customization

Replace the text logo in `/src/app/components/kiosk/KioskLayout.tsx`:

**Text logo (current):**
```typescript
<div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
  <span className="text-white font-bold text-lg">B</span>
</div>
```

**Image logo:**
```typescript
<img 
  src="/path/to/logo.svg" 
  alt="Brand Logo"
  className="h-10 w-auto"
/>
```

### Clock Format

**Change to 24-hour format** in `/src/app/components/kiosk/KioskLayout.tsx`:

```typescript
const formatTime = (date: Date) => {
  return date.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,  // ← Add this
  });
};
```

### Similar Products Algorithm

**Change similarity logic** in `/src/utils/productHelpers.ts`:

```typescript
function calculateSimilarityScore(product1: Product, product2: Product): number {
  let score = 0;
  
  // Same category: higher weight
  if (product1.category === product2.category) {
    score += 20;  // Increased from 10
  }
  
  // Shared tags: lower weight
  const sharedTags = product1.tags.filter(tag => product2.tags.includes(tag));
  score += sharedTags.length * 3;  // Decreased from 5
  
  return score;
}
```

**Show more/fewer similar products:**

In `/src/config/kiosk.config.ts`:
```typescript
modal: {
  similarProductsCount: 8,  // Show 8 instead of 6
}
```

## Environment Variables

For production deployments, consider using environment variables:

Create `.env`:
```
VITE_BRAND_NAME=Kiosk QR
VITE_API_URL=https://api.example.com
VITE_CDN_URL=https://cdn.example.com
VITE_IDLE_TIMEOUT=45000
```

Access in code:
```typescript
const brandName = import.meta.env.VITE_BRAND_NAME || 'Kiosk QR';
```

## Performance Optimization

### Image Optimization

**Use a CDN** with automatic image optimization:
- Cloudinary
- Imgix
- Cloudflare Images

Example with Cloudinary:
```typescript
imageUrl: "https://res.cloudinary.com/demo/image/upload/w_800,q_80,f_auto/sample.jpg"
```

### Lazy Loading

Already enabled by default. To disable:

In `/src/app/components/kiosk/GalleryCard.tsx`:
```typescript
<img
  src={product.imageUrl}
  alt={product.title}
  loading="eager"  // Change from "lazy"
/>
```

### Code Splitting

For very large catalogs (100+ products), consider lazy loading the gallery:

```typescript
const GalleryGrid = lazy(() => import('./components/kiosk/GalleryGrid'));

<Suspense fallback={<GallerySkeleton />}>
  <GalleryGrid ... />
</Suspense>
```

## Testing Your Changes

1. **Start dev server:**
   ```bash
   pnpm run dev
   ```

2. **Test on actual hardware:**
   ```bash
   pnpm run dev --host
   # Access from kiosk: http://[your-ip]:5173
   ```

3. **Build and test production:**
   ```bash
   pnpm run build
   pnpm preview
   ```

4. **Check different screen sizes:**
   - Use browser dev tools (F12)
   - Test on actual kiosk display
   - Test touch interactions

## Common Issues

**Products not showing:**
- Check product data structure matches `Product` interface
- Verify image URLs are accessible
- Check browser console for errors

**Slow performance:**
- Optimize images (reduce size, use WebP)
- Reduce number of products shown initially
- Disable animations
- Check network speed

**Touch not working:**
- Ensure touch targets are minimum 52px
- Test with actual touch screen
- Check CSS `pointer-events`

**Translations missing:**
- Verify all keys exist in both `en` and `tr`
- Check for typos in translation keys
- Use `t('key')` function correctly

---

Need more help? Check the main README.md or FEATURES.md documentation.
