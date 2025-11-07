# Gallery Images

Place your gallery photos here.

## Instructions

1. **Add Your Photos:**
   - Place JPG/PNG images in this folder
   - Example: `photo-1.jpg`, `photo-2.jpg`, etc.

2. **Update Configuration:**
   - Edit `/src/config/site-config.ts`
   - Update the `galleryImages` array with your image paths:

```typescript
galleryImages: [
  {
    src: "/images/gallery/photo-1.jpg",
    alt: "Description of the photo",
    caption: "Optional caption text"
  },
  {
    src: "/images/gallery/photo-2.jpg",
    alt: "Another photo description",
    caption: "Another caption"
  },
  // Add more...
]
```

## Recommendations

- **Format:** JPG or PNG
- **Size:** 1920x1080px (Full HD) or similar aspect ratio
- **File Size:** Keep under 500KB for faster loading
- **Naming:** Use descriptive names (e.g., `family-gathering.jpg`)

## Image Optimization

Before uploading, consider optimizing your images:

- Use tools like TinyPNG, ImageOptim, or Squoosh
- This reduces file size without losing quality
- Faster page load times

## Current Setup

The carousel will display images in the order you list them in the config file.

Features:

- Smooth slide transitions
- Arrow navigation
- Dot indicators  
- Swipe gestures on mobile
- Image counter
- Optional captions
