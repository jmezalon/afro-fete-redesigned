# Logo Component Usage Guide

This guide explains how to use the Afro-fete logo in your React application.

## Files Created

1. **Logo.jsx** - React component (`/src/components/Logo.jsx`)
2. **afro-fete-logo.svg** - Standalone SVG file (`/src/assets/logo/afro-fete-logo.svg`)

---

## React Component Usage

### Basic Import

```jsx
import Logo from './components/Logo';
```

### Examples

#### 1. Full Logo (Default)
```jsx
<Logo />
```
- Default size: 200x60px
- Shows dancing figure icon + "afro fête" text
- Uses currentColor (inherits text color)

#### 2. Custom Size
```jsx
<Logo width={300} height={90} />
```

#### 3. Icon Only (for Favicon/Small Spaces)
```jsx
<Logo iconOnly width={40} />
```
- Shows only the dancing figure
- Perfect for favicons, mobile headers, or tight spaces

#### 4. With Custom Styling
```jsx
<Logo className="text-white hover:text-yellow-400 transition-colors" />
```
- The logo uses `currentColor`, so it inherits the text color
- Works perfectly with Tailwind CSS utility classes

#### 5. In Header/Navigation
```jsx
import { Link } from 'react-router-dom';
import Logo from './components/Logo';

function Header() {
  return (
    <header className="bg-black text-white p-4">
      <Link to="/" className="inline-block">
        <Logo className="hover:opacity-80 transition-opacity" />
      </Link>
    </header>
  );
}
```

#### 6. Responsive Logo
```jsx
<div className="hidden md:block">
  <Logo width={200} height={60} />
</div>
<div className="md:hidden">
  <Logo iconOnly width={40} />
</div>
```

---

## Standalone SVG Usage

### In HTML
```html
<img src="/src/assets/logo/afro-fete-logo.svg" alt="Afro-fete" width="200" />
```

### As Background Image (CSS)
```css
.logo-bg {
  background-image: url('/src/assets/logo/afro-fete-logo.svg');
  background-size: contain;
  background-repeat: no-repeat;
  width: 200px;
  height: 60px;
}
```

### In React (Direct Import)
```jsx
import logoSvg from './assets/logo/afro-fete-logo.svg';

function Component() {
  return <img src={logoSvg} alt="Afro-fete" width={200} />;
}
```

---

## Theming

The logo uses `currentColor` which means it automatically adapts to the text color of its parent element.

### Light Theme
```jsx
<div className="text-black">
  <Logo />
</div>
```

### Dark Theme
```jsx
<div className="text-white">
  <Logo />
</div>
```

### Accent Colors
```jsx
<div className="text-yellow-400">
  <Logo />
</div>

<div className="text-purple-600">
  <Logo />
</div>
```

---

## Favicon Setup

### 1. Generate Favicon from Icon-Only Logo

Create a favicon.svg in your public directory:

```jsx
// In a script or component
import Logo from './components/Logo';
import { renderToString } from 'react-dom/server';

const faviconSvg = renderToString(<Logo iconOnly width={32} />);
// Save this to public/favicon.svg
```

Or manually create `/public/favicon.svg`:
```svg
<svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(8, 6)">
    <circle cx="12" cy="8" r="4" fill="black"/>
    <path d="M12 12 L10 20 M12 12 L14 20" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M12 13 L6 16 M12 13 L16 10" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M10 20 L8 28 M14 20 L18 26" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M4 15 Q6 14 7 15" stroke="black" stroke-width="0.8" stroke-linecap="round" opacity="0.5"/>
    <path d="M17 9 Q18 8 19 9" stroke="black" stroke-width="0.8" stroke-linecap="round" opacity="0.5"/>
  </g>
</svg>
```

### 2. Update index.html
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

---

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | number | 200 | Width of the logo in pixels |
| `height` | number | 60 | Height of the logo in pixels |
| `className` | string | '' | Additional CSS classes |
| `iconOnly` | boolean | false | Show only the dancing figure icon |

---

## Design Notes

- **Typography:** Georgia/Times New Roman serif fonts for elegance
- **Icon:** Dancing figure represents celebration and movement
- **Color:** Uses `currentColor` for maximum flexibility
- **Weight:** "afro" is lighter (300), "fête" is bolder (600) for visual hierarchy
- **Accent:** Subtle underline on "fête" adds sophistication

---

## Accessibility

The logo includes:
- `aria-label` for screen readers
- Semantic SVG structure
- Proper contrast when used with appropriate background colors

Always ensure:
```jsx
<Logo className="text-black" /> // On light backgrounds
<Logo className="text-white" /> // On dark backgrounds
```

---

## Performance Tips

1. **Use React Component** for better tree-shaking and bundle optimization
2. **Lazy Load** if logo appears below the fold
3. **Cache SVG** - The standalone SVG can be cached by browsers
4. **Inline Critical SVGs** - For above-the-fold logos, use the React component

---

## Examples in Common Scenarios

### App Header
```jsx
function AppHeader() {
  return (
    <header className="bg-gradient-to-r from-purple-900 to-black text-white py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/">
          <Logo className="hover:opacity-90 transition" />
        </Link>
        {/* Navigation menu */}
      </div>
    </header>
  );
}
```

### Loading Screen
```jsx
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <Logo className="text-white animate-pulse" width={300} height={90} />
    </div>
  );
}
```

### Footer
```jsx
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8">
      <div className="container mx-auto">
        <Logo className="mb-4 opacity-60" width={150} height={45} />
        <p>© 2025 Afro-fete. All rights reserved.</p>
      </div>
    </footer>
  );
}
```

---

*For questions or customization requests, refer to the main project documentation.*
