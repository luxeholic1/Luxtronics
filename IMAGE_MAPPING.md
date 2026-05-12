# Background Image Mapping Guide

## Quick Reference

```
┌─────────────────────────────────────────────────────────────┐
│                     HERO SECTION                            │
│  Desktop: hero.jpg        Mobile: mob1.jpg                  │
│  - Full screen height                                       │
│  - Fixed parallax on desktop                                │
│  - Main landing section                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  PROMO BANNER (Left Card)                   │
│  Desktop: bg-store.jpg    Mobile: mob1.jpg                  │
│  - Pro Laptops promotion                                    │
│  - "up to 30% off"                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 PROMO BANNER (Right Card)                   │
│  Desktop: bg-store.jpg    Mobile: mob1.jpg                  │
│  - Camera promotion                                         │
│  - "Capture the extraordinary"                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              CATEGORY STRIP / SHOP SECTION                  │
│  Desktop: shop.jpg        Mobile: mob2.jpg                  │
│  - "Find what moves you"                                    │
│  - Category grid display                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  NEWSLETTER SECTION                         │
│  Desktop: newsletter.jpg  Mobile: mob3.jpg                  │
│  - "Get 10% off your first order"                           │
│  - Email subscription form                                  │
└─────────────────────────────────────────────────────────────┘
```

## Image Usage Summary

### Desktop Images (≥768px)

| Image File      | Used In                    | Purpose                          |
|-----------------|----------------------------|----------------------------------|
| `hero.jpg`      | Hero Section               | Main landing background          |
| `shop.jpg`      | Category Strip             | Shop/category showcase           |
| `newsletter.jpg`| Newsletter Section         | Subscription call-to-action      |
| `bg-store.jpg`  | Promo Banner (both cards)  | Product promotions               |

### Mobile Images (<768px)

| Image File | Used In                    | Purpose                          |
|------------|----------------------------|----------------------------------|
| `mob1.jpg` | Hero + Promo Banner        | Main landing + promotions        |
| `mob2.jpg` | Category Strip             | Shop/category showcase           |
| `mob3.jpg` | Newsletter Section         | Subscription call-to-action      |

## Component Files Modified

1. **`Hero.tsx`**
   - Imports: `hero.jpg`, `mob1.jpg`
   - Breakpoint: 768px
   - Special: Fixed attachment on desktop

2. **`CategoryStrip.tsx`**
   - Imports: `shop.jpg`, `mob2.jpg`
   - Breakpoint: 768px
   - Special: Tech grid overlay

3. **`Newsletter.tsx`**
   - Imports: `newsletter.jpg`, `mob3.jpg`
   - Breakpoint: 768px
   - Special: Gradient overlay

4. **`PromoBanner.tsx`**
   - Imports: `bg-store.jpg`, `mob1.jpg`
   - Breakpoint: 768px
   - Special: Used for both promo cards

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    🖼️  HERO SECTION                         │
│              (hero.jpg / mob1.jpg)                          │
│                                                             │
│  "Premium Tech For Everyday Life"                           │
│  [Explore Now] [Browse Categories]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Brand Marquee                            │
│  APPLE  SONY  SAMSUNG  BOSE  DJI  CANON                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Flash Deals Banner                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────┬──────────────────────────────────┐
│  🖼️  PROMO LEFT          │  🖼️  PROMO RIGHT                 │
│  (bg-store.jpg/mob1.jpg) │  (bg-store.jpg/mob1.jpg)         │
│                          │                                  │
│  "Pro Laptops"           │  "Capture the extraordinary"     │
│  "up to 30% off"         │                                  │
└──────────────────────────┴──────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              🖼️  CATEGORY STRIP SECTION                     │
│                (shop.jpg / mob2.jpg)                        │
│                                                             │
│  "Find what moves you"                                      │
│  [📱] [🎧] [⌚] [💻] [🎮] [📷]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Featured Products                          │
│  [Product Grid]                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Testimonials                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Trust Badges                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              🖼️  NEWSLETTER SECTION                         │
│           (newsletter.jpg / mob3.jpg)                       │
│                                                             │
│  "Get 10% off your first order"                             │
│  [Email Input] [Subscribe]                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       Footer                                │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop View (≥768px)
- High-resolution landscape images
- Fixed parallax effect on Hero
- Better visual impact
- Larger file sizes acceptable

### Mobile View (<768px)
- Optimized portrait images
- Scroll attachment for performance
- Faster loading
- Smaller file sizes

### Transition Point (768px)
- Smooth image switching
- No layout shift
- Maintains aspect ratios
- Preserves overlays and effects

## Image Specifications

### Desktop Images
```
hero.jpg        → 1920x1080px (landscape)
shop.jpg        → 1920x1080px (landscape)
newsletter.jpg  → 1920x1080px (landscape)
bg-store.jpg    → 1920x1080px (landscape)
```

### Mobile Images
```
mob1.jpg → 768x1024px (portrait) - Used for Hero + Promo
mob2.jpg → 768x1024px (portrait) - Used for Category Strip
mob3.jpg → 768x1024px (portrait) - Used for Newsletter
```

## Color Overlay System

All sections have dark overlays for text readability:

```css
/* Light Mode */
bg-black/30  (30% opacity) - Category Strip, Newsletter
bg-black/40  (40% opacity) - Hero, Promo Banner

/* Dark Mode */
bg-black/40  (40% opacity) - Category Strip, Newsletter
bg-black/50  (50% opacity) - Hero, Promo Banner
```

## Testing URLs

To test responsive images:

1. **Desktop**: Open browser at 1920px width
2. **Tablet**: Resize to 768px width
3. **Mobile**: Resize to 375px width
4. **Transition**: Slowly resize across 768px to see switching

### Browser DevTools
```
Chrome/Edge: F12 → Toggle Device Toolbar (Ctrl+Shift+M)
Firefox: F12 → Responsive Design Mode (Ctrl+Shift+M)
Safari: Develop → Enter Responsive Design Mode
```

## Quick Tips

✅ **DO:**
- Use high-quality images (80-85% JPG quality)
- Compress images before uploading
- Test on real devices
- Check text readability on all backgrounds
- Verify loading performance

❌ **DON'T:**
- Use images larger than 500KB (desktop) or 300KB (mobile)
- Forget to test at 768px breakpoint
- Remove dark overlays (text won't be readable)
- Use portrait images for desktop
- Use landscape images for mobile

## Need to Change Images?

Simply replace the files in `/src/assets/` with the same names:
- `hero.jpg`, `shop.jpg`, `newsletter.jpg`, `bg-store.jpg`
- `mob1.jpg`, `mob2.jpg`, `mob3.jpg`

No code changes needed! 🎉
