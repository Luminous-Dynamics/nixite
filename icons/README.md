# Nixite PWA Icons

This directory should contain the app icons for the Progressive Web App.

## Required Icon Sizes

The manifest.json references the following icon sizes:

- 72x72 → `icon-72x72.png`
- 96x96 → `icon-96x96.png`
- 128x128 → `icon-128x128.png`
- 144x144 → `icon-144x144.png`
- 152x152 → `icon-152x152.png`
- 192x192 → `icon-192x192.png`
- 384x384 → `icon-384x384.png`
- 512x512 → `icon-512x512.png`

## How to Generate Icons

### Option 1: Using Online Tools

**PWA Icon Generator:**
1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your master icon (at least 512x512 px)
3. Download the generated icons
4. Extract them to this directory

**RealFaviconGenerator:**
1. Go to https://realfavicongenerator.net/
2. Upload your master icon
3. Configure PWA settings
4. Download and extract to this directory

### Option 2: Using ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# Create all sizes from a master icon
convert master-icon.png -resize 72x72 icon-72x72.png
convert master-icon.png -resize 96x96 icon-96x96.png
convert master-icon.png -resize 128x128 icon-128x128.png
convert master-icon.png -resize 144x144 icon-144x144.png
convert master-icon.png -resize 152x152 icon-152x152.png
convert master-icon.png -resize 192x192 icon-192x192.png
convert master-icon.png -resize 384x384 icon-384x384.png
convert master-icon.png -resize 512x512 icon-512x512.png
```

### Option 3: Using Node.js Script

```javascript
// generate-icons.js
const sharp = require('sharp');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  sharp('master-icon.png')
    .resize(size, size)
    .toFile(`icon-${size}x${size}.png`)
    .then(() => console.log(`Generated ${size}x${size}`))
    .catch(err => console.error(err));
});
```

## Icon Design Guidelines

**Best Practices:**
- Use a simple, recognizable design
- Ensure the icon works at small sizes (72x72)
- Use solid backgrounds (avoid transparency for some platforms)
- Test on both light and dark backgrounds
- Leave some padding (safe zone ~10% from edges)

**Maskable Icons:**
- The manifest marks these as "maskable"
- Ensure important content is in the center 80% of the icon
- Outer 20% may be cropped by system masks

**Colors:**
- Use Nixite brand colors (purple gradient)
- Ensure good contrast
- Avoid overly complex gradients at small sizes

## Temporary Solution

Until custom icons are created, Nixite will use:
- Browser's default PWA icon
- Or a placeholder "N" icon with gradient background

The PWA will function correctly even without custom icons, though they improve the user experience significantly.

## Testing Icons

After generating:

1. Update `manifest.json` if needed
2. Clear browser cache
3. Reinstall the PWA
4. Check home screen icon appearance
5. Verify splash screen (uses 512x512 typically)

## Additional Assets

**App Shortcuts** (optional):
- search-96x96.png
- favorites-96x96.png
- stats-96x96.png

**Screenshots** (for app stores):
- desktop-1.png (1280x720)
- desktop-2.png (1280x720)
- mobile-1.png (750x1334)

## References

- [PWA Icon Guidelines](https://web.dev/add-manifest/#icons)
- [Maskable Icons](https://web.dev/maskable-icon/)
- [Apple Touch Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
