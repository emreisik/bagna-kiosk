# Getting Started with Kiosk QR Kiosk Catalog

Welcome! This guide will help you get started with the Kiosk QR kiosk catalog application in the right order.

## 📚 Recommended Reading Order

### 1️⃣ First Time Setup (5 minutes)
Start here if this is your first time:

1. **QUICKSTART.md** - Get the app running locally
   - Install dependencies
   - Start dev server
   - See it in action

### 2️⃣ Understanding the Project (10 minutes)
Once running, understand what you have:

2. **README.md** - Project overview and features
   - What it does
   - Key features
   - Basic usage

3. **FEATURES.md** - Detailed feature walkthrough
   - User interactions
   - UI components
   - Technical features

### 3️⃣ Customization (30 minutes)
Make it yours:

4. **CUSTOMIZATION.md** - Step-by-step customization guide
   - Change brand name
   - Add your products
   - Adjust colors and layout
   - Configure behavior

5. **Edit these files:**
   - `/src/data/products.ts` - Your product catalog
   - `/src/i18n/translations.ts` - Brand name and text
   - `/src/config/kiosk.config.ts` - Settings

### 4️⃣ Deployment (1 hour)
When ready to go live:

6. **KIOSK_SETUP.md** - Production deployment guide
   - Hardware setup
   - Software configuration
   - Kiosk mode launch
   - Auto-start and monitoring

### 5️⃣ Deep Dive (Optional)
For developers who want to understand everything:

7. **PROJECT_OVERVIEW.md** - Technical architecture
   - Project structure
   - Component architecture
   - State management
   - Performance optimizations

8. **FILE_INDEX.md** - Complete file reference
   - What each file does
   - Where to find things
   - Quick file lookup

### 6️⃣ Contributing (Optional)
If you want to improve the project:

9. **CONTRIBUTING.md** - Contribution guidelines
   - How to report bugs
   - How to suggest features
   - How to submit pull requests

10. **ROADMAP.md** - Future plans
    - Planned features
    - Version roadmap
    - Community requests

## 🎯 Quick Start Paths

### Path A: "I just want to see it running"
1. `pnpm install`
2. `pnpm run dev`
3. Open http://localhost:5173
4. **Done!**

### Path B: "I want to customize it for my brand"
1. Follow Path A
2. Edit `/src/data/products.ts` - Add your products
3. Edit `/src/i18n/translations.ts` - Change brand name
4. Refresh browser
5. **Done!**

### Path C: "I want to deploy to a kiosk"
1. Follow Path B
2. `pnpm run build`
3. Read **KIOSK_SETUP.md**
4. Set up kiosk hardware
5. Launch in kiosk mode
6. **Done!**

### Path D: "I want to contribute/extend"
1. Follow Path A
2. Read **PROJECT_OVERVIEW.md**
3. Read **CONTRIBUTING.md**
4. Make your changes
5. Submit pull request
6. **Done!**

## 🚀 Common First Tasks

### Task 1: Change the Brand Name
**Time:** 2 minutes

```typescript
// Edit: /src/i18n/translations.ts
export const translations = {
  en: {
    brand: "YOUR BRAND",  // ← Change this
    slogan: "Your Tagline",
  },
  tr: {
    brand: "YOUR BRAND",
    slogan: "Sizin Sloganınız",
  }
};
```

Save, refresh. Done!

### Task 2: Add Your First Product
**Time:** 3 minutes

```typescript
// Edit: /src/data/products.ts
export const products: Product[] = [
  {
    id: "my-product-1",
    title: "My Awesome Product",
    imageUrl: "https://images.unsplash.com/photo-...",
    category: "furniture",
    tags: ["modern", "new"],
    shortDesc: "This is my first product"
  },
  // ... existing products
];
```

Save, refresh. Done!

### Task 3: Change Idle Timeout
**Time:** 1 minute

```typescript
// Edit: /src/config/kiosk.config.ts
behavior: {
  idleTimeoutMs: 60000,  // 60 seconds instead of 45
}
```

Save, refresh. Done!

### Task 4: Show Product Titles
**Time:** 1 minute

```typescript
// Edit: /src/app/pages/ProductsPage.tsx
// Find line ~88 and change:
<GalleryGrid
  showTitles={true}  // ← Change false to true
/>
```

Save, refresh. Done!

### Task 5: Change Colors
**Time:** 5 minutes

```css
/* Edit: /src/styles/theme.css */
:root {
  --background: #f5f5f5;  /* Light gray instead of white */
  --foreground: #1a1a1a;  /* Dark gray instead of black */
  --primary: #2563eb;     /* Blue accent */
}
```

Save, refresh. Done!

## 📋 Checklist for First-Time Users

- [ ] Clone/download the repository
- [ ] Install dependencies (`pnpm install`)
- [ ] Start dev server (`pnpm run dev`)
- [ ] Open browser to http://localhost:5173
- [ ] Browse the gallery
- [ ] Try filtering products
- [ ] Open a product detail
- [ ] Switch language (TR/EN)
- [ ] Wait 45 seconds to see attract mode
- [ ] Read README.md
- [ ] Read QUICKSTART.md
- [ ] Customize brand name
- [ ] Add first product
- [ ] Test on touch device
- [ ] Build for production (`pnpm run build`)
- [ ] Deploy to kiosk (if applicable)

## 🆘 Need Help?

**Problem:** Something's not working
- Check browser console (F12) for errors
- Verify Node.js version (18+)
- Try `rm -rf node_modules && pnpm install`
- Read QUICKSTART.md troubleshooting section

**Question:** How do I...?
- Check FILE_INDEX.md for file locations
- Read CUSTOMIZATION.md for how-tos
- Search documentation files
- Check FEATURES.md for capabilities

**Want to learn more:**
- Read PROJECT_OVERVIEW.md for architecture
- Review component files in `/src/app/components/kiosk/`
- Check ROADMAP.md for future features

## 🎓 Learning Resources

### Beginner Level
1. QUICKSTART.md - Basic setup
2. README.md - Project overview
3. CUSTOMIZATION.md - Simple changes

### Intermediate Level
4. FEATURES.md - Detailed features
5. KIOSK_SETUP.md - Deployment
6. Product data structure

### Advanced Level
7. PROJECT_OVERVIEW.md - Architecture
8. Component source code
9. CONTRIBUTING.md - Development
10. Utility functions

## 🗺️ Navigation Tips

**All Documentation:**
- Located in project root (*.md files)
- Markdown format (readable in any text editor)
- Contains code examples

**All Code:**
- Located in `/src` folder
- TypeScript/TSX files
- Well-commented

**All Configuration:**
- `/src/config/kiosk.config.ts` - App settings
- `/src/styles/theme.css` - Design tokens
- `/src/data/products.ts` - Product data
- `/src/i18n/translations.ts` - Text translations

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Initial setup | 5 min |
| First customization | 10 min |
| Add 10 products | 20 min |
| Change colors/branding | 15 min |
| Deploy to kiosk | 1-2 hours |
| Full customization | 2-4 hours |
| Read all docs | 1 hour |

## 🎯 Success Criteria

You're ready to deploy when:
- ✅ App runs without errors
- ✅ All products display correctly
- ✅ Filters work as expected
- ✅ Branding matches your needs
- ✅ Tested on actual kiosk hardware
- ✅ Touch interactions are smooth
- ✅ Attract mode works correctly
- ✅ Images load quickly

## 🎉 Next Steps

After completing this guide:
1. Customize for your brand (CUSTOMIZATION.md)
2. Add your product catalog
3. Test thoroughly
4. Deploy to kiosk (KIOSK_SETUP.md)
5. Monitor performance
6. Gather feedback
7. Iterate and improve

## 📞 Support

**Documentation:** All .md files in project root  
**Code:** Well-commented source in /src  
**Community:** Check CONTRIBUTING.md  
**Issues:** Follow bug report template

---

**Ready?** Start with QUICKSTART.md!

**Questions?** Check FILE_INDEX.md for quick lookup.

**Stuck?** Read the specific guide for your task.

---

**Last Updated:** February 10, 2026  
**Version:** 1.0.0  
**Status:** Production Ready
