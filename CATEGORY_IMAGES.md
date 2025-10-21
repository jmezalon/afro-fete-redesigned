# Category Image Recommendations for Afro-fete

This document provides free stock photo sources and placeholder URLs for the 8 event categories.

## Free Stock Photo Sources

### Recommended Platforms (Free, High-Quality)
1. **Unsplash** (https://unsplash.com) - No attribution required
2. **Pexels** (https://pexels.com) - Free for commercial use
3. **Pixabay** (https://pixabay.com) - Free images and videos
4. **Picsum Photos** (https://picsum.photos) - Placeholder images with specific dimensions

---

## Category Images

### 1. Brunch
**Theme:** Vibrant food, outdoor dining, social gathering, mimosas

**Recommended Sources:**
- **Unsplash Search:** `african brunch` or `caribbean food brunch`
- **Pexels Search:** `brunch party` or `outdoor brunch`

**Suggested Specific Images:**
- Unsplash: https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800
- Pexels: https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=800

**Placeholder URL (for development):**
```
https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&h=600&fit=crop
```

---

### 2. Nightlife
**Theme:** Club scene, dancing, DJ, neon lights, energetic atmosphere

**Recommended Sources:**
- **Unsplash Search:** `nightclub dancing` or `afrobeats party`
- **Pexels Search:** `nightclub` or `party lights`

**Suggested Specific Images:**
- Unsplash: https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800
- Pexels: https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?w=800

**Placeholder URL (for development):**
```
https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop
```

---

### 3. Festivals
**Theme:** Outdoor celebration, crowds, cultural festivities, vibrant colors

**Recommended Sources:**
- **Unsplash Search:** `caribbean festival` or `cultural festival`
- **Pexels Search:** `outdoor festival` or `carnival`

**Suggested Specific Images:**
- Unsplash: https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800
- Pexels: https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?w=800

**Placeholder URL (for development):**
```
https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop
```

---

### 4. Arts
**Theme:** Gallery, performances, creative expression, cultural art

**Recommended Sources:**
- **Unsplash Search:** `art gallery` or `african art exhibition`
- **Pexels Search:** `art gallery` or `cultural performance`

**Suggested Specific Images:**
- Unsplash: https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800
- Pexels: https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?w=800

**Placeholder URL (for development):**
```
https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop
```

---

### 5. Afterwork
**Theme:** Professional social gathering, happy hour, rooftop bars, networking

**Recommended Sources:**
- **Unsplash Search:** `happy hour` or `rooftop bar`
- **Pexels Search:** `afterwork drinks` or `professional networking`

**Suggested Specific Images:**
- Unsplash: https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800
- Pexels: https://images.pexels.com/photos/1267696/pexels-photo-1267696.jpeg?w=800

**Placeholder URL (for development):**
```
https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&h=600&fit=crop
```

---

### 6. Concerts
**Theme:** Live music performance, stage, audience, energy

**Recommended Sources:**
- **Unsplash Search:** `live concert` or `music performance`
- **Pexels Search:** `concert stage` or `music festival`

**Suggested Specific Images:**
- Unsplash: https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800
- Pexels: https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?w=800

**Placeholder URL (for development):**
```
https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop
```

---

### 7. Day Party
**Theme:** Outdoor daytime celebration, pool party, summer vibes, social gathering

**Recommended Sources:**
- **Unsplash Search:** `day party` or `pool party`
- **Pexels Search:** `outdoor party` or `summer party`

**Suggested Specific Images:**
- Unsplash: https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800
- Pexels: https://images.pexels.com/photos/1115816/pexels-photo-1115816.jpeg?w=800

**Placeholder URL (for development):**
```
https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop
```

---

### 8. Boat Rides
**Theme:** Yacht party, cruise, waterfront celebration, luxury

**Recommended Sources:**
- **Unsplash Search:** `yacht party` or `boat party`
- **Pexels Search:** `boat cruise` or `yacht celebration`

**Suggested Specific Images:**
- Unsplash: https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800
- Pexels: https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg?w=800

**Placeholder URL (for development):**
```
https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop
```

---

## Implementation Guide

### Using Unsplash URLs in Your Code

```javascript
const categoryImages = {
  brunch: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&h=600&fit=crop',
  nightlife: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
  festivals: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
  arts: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop',
  afterwork: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&h=600&fit=crop',
  concerts: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
  dayparty: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop',
  boatrides: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
};
```

### Unsplash URL Parameters
You can customize images using URL parameters:
- `w=800` - Width in pixels
- `h=600` - Height in pixels
- `fit=crop` - Crop to fit dimensions
- `q=80` - Quality (1-100)
- `auto=format` - Automatic format selection

### Alternative: Download and Host Locally
For better performance and reliability:
1. Download images from the sources above
2. Optimize them (compress, resize)
3. Place them in `/src/assets/event-category/`
4. Import them in your React components

---

## Best Practices

1. **Image Optimization:**
   - Use WebP format when possible
   - Compress images to reduce load time
   - Use responsive images for different screen sizes

2. **Accessibility:**
   - Always include alt text describing the image
   - Ensure images have good contrast

3. **Performance:**
   - Use lazy loading for images below the fold
   - Consider using a CDN for faster delivery
   - Implement placeholder/blur-up technique while loading

4. **Legal:**
   - Unsplash and Pexels images are free for commercial use
   - No attribution required, but it's appreciated
   - Check license before use if downloading from other sources

---

## Additional Resources

- **Specific Afro-Caribbean Content:**
  - Search "afrobeats" on Unsplash
  - Search "caribbean" on Pexels
  - Consider Getty Images for premium, culturally-specific content

- **Custom Photography:**
  - Consider hiring a photographer for authentic, brand-specific images
  - Attend local events and capture authentic moments
  - Build a library of user-generated content

---

*Last Updated: 2025-10-21*
