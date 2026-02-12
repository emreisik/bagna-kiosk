# Kiosk QR Kiosk Catalog - Features Overview

## User Interactions

### Main Gallery View (`/products`)
- **View Products:** Browse image-only product cards in responsive grid
- **Tap Product:** Opens detailed view in modal overlay
- **Filter Products:** Tap "Filters" button to open bottom sheet
- **Search:** Type in search field to filter by title, description, category, or tags
- **Language Switch:** Tap language toggle (TR/EN) in top-right header
- **Idle Mode:** After 45 seconds of inactivity, attract mode overlay appears

### Product Detail Modal
- **Large Image:** Full-size product photography
- **Product Info:** Title, category, description, and tags
- **Similar Products:** Thumbnails of related items below
- **Navigation:** Tap "Back" button or close (X) to return to gallery
- **Explore Similar:** Tap similar product thumbnail to view its details

### Filter Sheet
- **Categories:** Filter by Furniture, Lighting, or Decor
- **Tags:** Multi-select tags like Modern, Minimalist, Wood, etc.
- **Search:** Real-time text search across all product fields
- **Active Filters:** Badge count shows number of active filters
- **Clear Selection:** Tap "All Categories" or deselect to reset
- **Close:** Tap outside sheet or X button to return to gallery

### Attract Mode (Idle State)
- **Auto-Trigger:** Activates after 45 seconds of no interaction
- **Animated Display:** Gradient background with brand name and slogan
- **Exit:** Tap anywhere on screen to return to gallery
- **Purpose:** Attracts attention and conserves display when idle

## Technical Features

### Performance
- ✅ Lazy loading images for faster initial load
- ✅ Optimized re-renders with React hooks
- ✅ Smooth animations at 60fps
- ✅ Responsive grid adapts to screen size
- ✅ Touch-optimized interactions

### Accessibility
- ✅ Large touch targets (52px minimum)
- ✅ High contrast black/white design
- ✅ Readable 18px+ base font size
- ✅ Keyboard navigation support
- ✅ Screen reader compatible structure

### Internationalization
- ✅ Turkish (default) and English
- ✅ Instant language switching
- ✅ Localized categories and tags
- ✅ Context-aware translations
- ✅ Persistent language preference

### Responsive Design
| Screen Size | Columns | Gap | Use Case |
|------------|---------|-----|----------|
| < 768px    | 2       | 32px | Tablet Portrait |
| 768-1024px | 3       | 32px | Tablet Landscape |
| 1024-1280px| 4       | 32px | Small Desktop |
| 1280-1536px| 5       | 32px | Desktop |
| > 1536px   | 6       | 32px | Large Display |

### Data Structure
```typescript
Product {
  id: string           // Unique identifier
  title: string        // Product name
  imageUrl: string     // High-quality image URL
  category: string     // furniture | lighting | decor
  tags: string[]       // Descriptive tags
  shortDesc: string    // Brief description
}
```

**Deliberately Excluded:**
- ❌ Price/currency fields
- ❌ Stock/inventory data
- ❌ Ratings/reviews
- ❌ Cart/checkout functionality
- ❌ User authentication
- ❌ Wishlist features

## UI Components

### KioskButton
- Variants: primary (black), secondary (white), ghost (transparent)
- Sizes: default, large, touch
- States: hover, active (scale down), disabled
- Uppercase text with wide tracking

### KioskInput
- 56px height for easy touch
- Large 18px+ text
- Focus state with black border
- Placeholder text in gray

### FilterSheet
- Bottom sheet modal (80% max height)
- Spring animation on open/close
- Dark backdrop overlay
- Scrollable content area
- Touch-friendly chip selection

### ProductDetailModal
- Full-screen overlay with rounded corners
- Two-column layout (image + details)
- Similar products grid below
- Close button (top-right)
- Backdrop click to close

### GalleryCard
- 3:4 aspect ratio
- Hover scale effect (102%)
- Tap scale effect (98%)
- Optional title caption
- Image zoom on hover
- Subtle dark overlay on interaction

### AttractOverlay
- Full-screen gradient background
- Animated radial gradients
- Large brand typography
- Pulsing "touch to explore" prompt
- Smooth fade in/out

### KioskLayout (Header)
- Fixed top position (80px height)
- Brand logo + name (left)
- Real-time clock (right)
- Language toggle (right)
- White background with bottom border
- Stays on top during scroll

## Filter Logic

### Category Filter
- Single selection only
- "All Categories" shows everything
- Instantly updates gallery

### Tag Filter
- Multiple selection allowed
- Products must match ALL selected tags (AND logic)
- Combine with category and search

### Search Filter
- Real-time filtering
- Searches across:
  - Product title
  - Description
  - Category name
  - All tags
- Case-insensitive matching
- Debounced for performance

### Combined Filters
Filters work together with AND logic:
```
Products shown = (category) AND (all tags) AND (search)
```

## Customization Options

### Toggle Product Titles
```typescript
// In ProductsPage.tsx
<GalleryGrid showTitles={true} />
```

### Adjust Idle Timeout
```typescript
// In ProductsPage.tsx
const isIdle = useIdleTimer(60000); // 60 seconds
```

### Grid Column Breakpoints
```typescript
// In GalleryGrid.tsx, modify className:
"grid-cols-2 md:grid-cols-3 lg:grid-cols-5..."
```

### Brand Information
```typescript
// In translations.ts
brand: "YOUR_BRAND",
slogan: "Your Tagline Here",
```

### Color Scheme
```css
/* In theme.css :root */
--background: #ffffff;  /* Change base colors */
--foreground: #000000;
```

## Browser Compatibility

### Recommended
- ✅ Chrome/Edge 90+
- ✅ Safari 14+
- ✅ Firefox 88+

### Required Features
- CSS Grid Layout
- CSS Custom Properties
- ES2020+ JavaScript
- Touch Events API
- Intersection Observer (for lazy loading)

## Performance Metrics

### Target Performance
- **Initial Load:** < 2 seconds
- **Image Loading:** Progressive (lazy)
- **Filter Response:** < 100ms
- **Modal Open:** < 200ms
- **Touch Response:** < 16ms (60fps)

### Image Optimization
- Format: WebP preferred, JPEG fallback
- Size: 800px width recommended
- Compression: 80% quality
- CDN: Recommended for production

## Future Enhancement Ideas

- 🔄 QR code sharing for products
- 📧 Email product details
- 🎨 Theme customization (light/dark modes)
- 🔊 Voice search capability
- 📊 Analytics tracking
- 🌐 Additional languages
- ♿ Enhanced accessibility features
- 📱 Mobile companion app
- 🎥 Product video support
- 🔍 Advanced search with autocomplete

---

**Current Version:** 1.0  
**Last Updated:** February 2026
