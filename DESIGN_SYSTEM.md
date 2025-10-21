# Afro Fete Design System

## Overview
This document outlines the design system for Afro Fete, derived from wireframe analysis and brand guidelines.

## Brand Identity

### Tagline
"Making memories is only a #hashtag away!"

### Logo
- Logo: `src/assets/logo/logo.png`
- Favicon: `src/assets/logo/favicon.ico`
- The logo features elegant serif typography with an Africa continent outline
- Both logo and favicon are available in the logo folder

## Color Palette

### Primary Colors
```javascript
primary: '#EF5654'  // Coral-red, used for CTAs, buttons, links
light:   '#FF7B79'  // Lighter variant for hovers
dark:    '#D93D3B'  // Darker variant for active states
```

### Grayscale
```javascript
gray-50:  '#FAFAFA'  // Lightest
gray-100: '#F5F5F5'  // Background for inputs, sidebars
gray-200: '#EEEEEE'
gray-300: '#E0E0E0'
gray-400: '#BDBDBD'
gray-500: '#9E9E9E'
gray-600: '#757575'
gray-700: '#616161'
gray-800: '#424242'
gray-900: '#2D2D2D'  // Footer background
```

### Dark Colors
```javascript
dark:    '#2D2D2D'  // Footer, dark sections
lighter: '#3A3A3A'
darker:  '#1A1A1A'
```

## Typography

### Font Families

#### Display/Serif (Playfair Display)
- Used for: Headlines, event titles, logo
- Weights: 400, 500, 600, 700
- Includes italic variants for hashtag emphasis

#### Sans-serif (Inter)
- Used for: Body text, UI elements, navigation
- Weights: 300, 400, 500, 600, 700

### Font Sizes
```
hero:    56px (3.5rem)  - Large hero headings
display: 48px (3rem)    - Display headings
h1:      40px (2.5rem)
h2:      32px (2rem)
h3:      24px (1.5rem)
h4:      20px (1.25rem)
h5:      18px (1.125rem)
base:    16px (1rem)    - Body text
sm:      14px (0.875rem)
xs:      12px (0.75rem)
```

### Tailwind CSS Classes
```jsx
// Display headings
className="font-display text-display"

// Italic hashtag emphasis
className="font-display italic text-primary"

// Body text
className="font-sans text-base"
```

## Components

### Buttons

#### Primary Button
```jsx
<button className="bg-primary text-white rounded-full px-8 py-3 hover:bg-primary-dark transition-colors">
  Sign Up
</button>
```

#### Outline Button
```jsx
<button className="border-2 border-primary text-primary rounded-full px-8 py-3 hover:bg-primary hover:text-white transition-colors">
  Log In
</button>
```

### Event Category Cards
```jsx
<div className="rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
  <img src={categoryImage} alt={categoryName} />
  <div className="p-4">
    <h3 className="font-display italic text-center">{hashtag}</h3>
  </div>
</div>
```

### Event Cards
- Rounded corners (rounded-lg)
- White background
- Light gray border or shadow
- Date displayed in coral-red
- Heart icon for favorites

### Newsletter Section
- Background: Primary coral color (#EF5654)
- White text
- White input fields
- Centered layout

### Footer
- Background: Dark (#2D2D2D)
- White text and logo
- Navigation links in white

## Layout Guidelines

### Spacing
- Use consistent spacing scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px, 96px
- Section padding: 48-96px (lg:pt-16 lg:pb-24)
- Component spacing: 16-32px

### Grid
- Event cards: 2-3 columns on desktop, 1-2 on tablet, 1 on mobile
- Category filters: Vertical sidebar on desktop, horizontal scroll on mobile
- Max content width: 1280px (max-w-7xl)

### Breakpoints
```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

## Event Categories

The application features 8 event categories, each with an associated image and hashtag:

1. **#brunch** - Brunch events and experiences
2. **#festivals** - Music festivals and cultural celebrations
3. **#nightlife** - Clubs, parties, and nightlife events
4. **#afterwork** - After-work social events and happy hours
5. **#arts** - Art exhibitions, galleries, and cultural events
6. **#concerts** - Live music and concert performances
7. **#dayparty** - Daytime parties and social gatherings
8. **#boatrides** - Boat parties and water-based events

### Category Images
Location: `src/assets/event-category/`

Import categories from: `src/data/eventCategories.js`

```javascript
import { EVENT_CATEGORIES, CATEGORY_IDS } from '@/data/eventCategories';
```

## Design Principles

### 1. Hashtag-Centric
- Hashtags are a core part of the brand identity
- Use italic serif font for hashtags
- Always display in coral-red color
- Prefix with # symbol

### 2. Image-First
- Event and category imagery should be prominent
- High-quality photos that showcase the vibe
- Rounded corners for a modern, friendly feel

### 3. Clean & Minimal
- White backgrounds with ample spacing
- Let images and content breathe
- Avoid visual clutter

### 4. Vibrant & Energetic
- The coral-red primary color conveys energy and excitement
- Use it strategically for CTAs and important elements
- Balance with neutral grays and whites

### 5. Elegant Typography
- Playfair Display adds sophistication
- Italic emphasis for special elements (hashtags, event categories)
- Clear hierarchy with size and weight

## Accessibility

- Maintain WCAG AA contrast ratios
- Primary coral (#EF5654) on white: 4.5:1 (AA compliant)
- Dark text (#2D2D2D) on white: AAA compliant
- Provide focus states for all interactive elements
- Use semantic HTML and ARIA labels where appropriate

## Usage Examples

### Hero Section
```jsx
<section className="py-16 px-4">
  <h1 className="font-display text-hero text-gray-900">
    Making memories is only a{' '}
    <span className="italic text-primary">#hashtag</span> away!
  </h1>
  <button className="bg-primary text-white rounded-full px-8 py-3 mt-8">
    Learn More
  </button>
</section>
```

### Category Filter Sidebar
```jsx
<aside className="bg-gray-100 p-6">
  {EVENT_CATEGORIES.map(category => (
    <div key={category.id} className="mb-4 cursor-pointer">
      <img
        src={category.image}
        alt={category.displayName}
        className="rounded-lg mb-2"
      />
      <h3 className="font-display italic text-center">{category.hashtag}</h3>
    </div>
  ))}
</aside>
```

## Resources

- **Wireframes**: `src/assets/wireframes/`
- **Theme Constants**: `src/data/theme.js`
- **Event Categories**: `src/data/eventCategories.js`
- **Tailwind Config**: `tailwind.config.js`
- **Google Fonts**: Playfair Display, Inter

## Next Steps

1. Implement reusable component library based on this design system
2. Create Storybook documentation for components
3. Build out page templates following wireframe layouts
4. Implement responsive behavior across all breakpoints
5. Add animations and transitions for enhanced UX
