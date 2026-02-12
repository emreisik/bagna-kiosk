# Quick Start Guide

Get the Kiosk QR kiosk catalog running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager (or npm/yarn)
- Modern web browser (Chrome, Edge, Safari, Firefox)

## Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Open browser
# Navigate to: http://localhost:5173
```

Done! 🎉 The kiosk should now be running.

## First Steps

### 1. Test the Interface

- **Browse products** - Scroll through the grid
- **Tap a product** - View details in modal
- **Open filters** - Click "FILTERS" button
- **Search** - Type in search field (opens automatically in filter sheet)
- **Switch language** - Click TR/EN toggle in header
- **Wait 45 seconds** - See attract mode activate
- **Tap anywhere** - Exit attract mode

### 2. Add Your First Product

Edit `/src/data/products.ts`:

```typescript
{
  id: "my-first-product",
  title: "My Awesome Product",
  imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  category: "furniture",
  tags: ["modern", "new"],
  shortDesc: "This is my first custom product"
}
```

Save the file. The page will auto-reload with your product.

### 3. Change the Brand Name

Edit `/src/i18n/translations.ts`:

```typescript
export const translations = {
  en: {
    brand: "MY BRAND",  // ← Change this
    slogan: "My Custom Tagline",
    // ...
  },
  tr: {
    brand: "MY BRAND",  // ← And this
    slogan: "Benim Sloganım",
    // ...
  }
};
```

### 4. Test on Touch Device

Get your local IP:
```bash
# On Mac/Linux
ifconfig | grep "inet "

# On Windows
ipconfig
```

Start dev server with network access:
```bash
pnpm run dev --host
```

Access from tablet/kiosk:
```
http://[YOUR_IP]:5173
```

## Common Tasks

### Change Idle Timeout

`/src/hooks/useIdleTimer.ts` - line 8:
```typescript
export function useIdleTimer(timeout: number = 60000) // 60 seconds
```

Or in `/src/app/pages/ProductsPage.tsx`:
```typescript
const isIdle = useIdleTimer(30000); // 30 seconds
```

### Show Product Titles

`/src/app/pages/ProductsPage.tsx` - line 88:
```typescript
<GalleryGrid
  products={filteredProducts}
  onProductClick={handleProductClick}
  showTitles={true}  // ← Change to true
/>
```

### Add a New Category

1. Add products with new category:
```typescript
{ category: "electronics", ... }
```

2. Add translation:
```typescript
categories: {
  electronics: "Electronics",
  // ...
}
```

### Disable Attract Mode

`/src/app/pages/ProductsPage.tsx`:

Comment out or remove:
```typescript
// const isIdle = useIdleTimer(45000);

// And remove:
// <AnimatePresence>
//   {isIdle && <AttractOverlay />}
// </AnimatePresence>
```

## Building for Production

```bash
# Build the app
pnpm run build

# Preview production build
pnpm preview

# Output is in /dist folder
# Deploy to your web server
```

## Deployment

### Static Hosting (Netlify, Vercel, etc.)

```bash
# Build command
pnpm run build

# Publish directory
dist
```

### Self-Hosted (Nginx)

```nginx
server {
    listen 80;
    server_name kiosk.example.com;
    root /var/www/Kiosk QR-kiosk/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t Kiosk QR-kiosk .
docker run -p 80:80 Kiosk QR-kiosk
```

## Troubleshooting

### Problem: Products not showing

**Check:**
- Browser console for errors (F12)
- Image URLs are accessible
- Product data structure is correct

**Fix:**
```typescript
// Ensure each product has all required fields
{
  id: "unique-id",        // ✓ Required
  title: "Product Name",   // ✓ Required
  imageUrl: "https://...", // ✓ Required
  category: "furniture",   // ✓ Required
  tags: ["modern"],        // ✓ Required (array)
  shortDesc: "..."         // ✓ Required
}
```

### Problem: Page is blank

**Fix:**
1. Check browser console (F12)
2. Verify all imports are correct
3. Restart dev server: `Ctrl+C` then `pnpm run dev`

### Problem: Images not loading

**Check:**
- Image URLs are accessible (open in new tab)
- CORS headers allow loading
- Images are not too large (>2MB)

**Fix:**
Use Unsplash or other reliable CDN for testing.

### Problem: Build fails

**Fix:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm -rf dist
pnpm install
pnpm run build
```

### Problem: Touch not working

**Ensure:**
- Browser supports touch events
- Touch targets are large enough (52px+)
- No conflicting event listeners
- Test on actual touch device, not mouse simulation

## Development Tips

### Hot Module Replacement (HMR)

The dev server supports HMR. Changes to files will auto-reload:
- ✅ Component changes
- ✅ Style changes
- ✅ Data changes
- ❌ Config changes (requires manual reload)

### Browser Dev Tools

**Useful shortcuts:**
- `F12` - Open dev tools
- `Ctrl+Shift+M` - Toggle device emulation
- `Ctrl+Shift+C` - Element inspector

**Test touch on desktop:**
1. Open dev tools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPad Pro" or similar
4. Click devices have touch events enabled

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

### File Structure Quick Reference

```
/src
  /app
    /components/kiosk  ← UI components
    /pages             ← Page components
    App.tsx            ← Root component
    routes.tsx         ← Routing config
  /contexts            ← React contexts
  /data                ← Product data ← EDIT THIS
  /hooks               ← Custom hooks
  /i18n                ← Translations ← EDIT THIS
  /config              ← Configuration ← EDIT THIS
  /utils               ← Helper functions
  /styles              ← CSS files
```

## Next Steps

1. ✅ **Read README.md** - Full documentation
2. ✅ **Check FEATURES.md** - Complete feature list
3. ✅ **Review CUSTOMIZATION.md** - Customization guide
4. ✅ **Read KIOSK_SETUP.md** - Production deployment
5. ✅ **Explore code** - Understand how it works
6. ✅ **Customize** - Make it your own
7. ✅ **Deploy** - Go live!

## Getting Help

**Documentation:**
- README.md - Main documentation
- FEATURES.md - Feature overview
- CUSTOMIZATION.md - How to customize
- KIOSK_SETUP.md - Kiosk deployment

**Common Issues:**
- Check browser console (F12)
- Verify Node.js version (18+)
- Clear cache and hard reload (Ctrl+Shift+R)
- Check network requests in dev tools

**Community:**
- GitHub Issues - Report bugs
- Discussions - Ask questions
- Email - support@example.com

---

**Ready to customize?** See CUSTOMIZATION.md  
**Ready to deploy?** See KIOSK_SETUP.md  
**Need features?** See ROADMAP.md
