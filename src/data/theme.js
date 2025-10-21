// Design system theme constants
// Based on wireframe analysis and brand guidelines

export const COLORS = {
  // Primary brand colors
  primary: {
    DEFAULT: '#EF5654',
    light: '#FF7B79',
    dark: '#D93D3B',
  },

  // Coral (alias for primary)
  coral: {
    DEFAULT: '#EF5654',
    light: '#FF7B79',
    dark: '#D93D3B',
  },

  // Grayscale
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#2D2D2D',
  },

  // Dark colors
  dark: {
    DEFAULT: '#2D2D2D',
    lighter: '#3A3A3A',
    darker: '#1A1A1A',
  },

  // Semantic colors
  white: '#FFFFFF',
  black: '#000000',
};

export const TYPOGRAPHY = {
  // Font families
  fonts: {
    display: ['Playfair Display', 'Georgia', 'serif'],
    serif: ['Playfair Display', 'Georgia', 'serif'],
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  },

  // Font sizes (in rem)
  sizes: {
    hero: '3.5rem',      // 56px - Large hero headings
    display: '3rem',     // 48px - Display headings
    h1: '2.5rem',        // 40px
    h2: '2rem',          // 32px
    h3: '1.5rem',        // 24px
    h4: '1.25rem',       // 20px
    h5: '1.125rem',      // 18px
    base: '1rem',        // 16px
    sm: '0.875rem',      // 14px
    xs: '0.75rem',       // 12px
  },

  // Font weights
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
};

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const DESIGN_TOKENS = {
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },

  transitions: {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
  },
};

// Design guidelines from wireframes
export const DESIGN_GUIDELINES = {
  // The hero section uses italic serif for hashtag emphasis
  heroStyle: {
    fontFamily: TYPOGRAPHY.fonts.serif,
    fontSize: TYPOGRAPHY.sizes.hero,
    italicHashtag: true,
    hashtagColor: COLORS.primary.DEFAULT,
  },

  // Event category cards
  categoryCard: {
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    overflow: 'hidden',
    hashtagFontStyle: 'italic',
  },

  // Buttons
  buttons: {
    primary: {
      backgroundColor: COLORS.primary.DEFAULT,
      color: COLORS.white,
      borderRadius: DESIGN_TOKENS.borderRadius.full,
      padding: '0.75rem 2rem',
    },
    outline: {
      borderColor: COLORS.primary.DEFAULT,
      color: COLORS.primary.DEFAULT,
      borderRadius: DESIGN_TOKENS.borderRadius.full,
      padding: '0.75rem 2rem',
    },
  },

  // Footer
  footer: {
    backgroundColor: COLORS.dark.DEFAULT,
    color: COLORS.white,
  },

  // Newsletter section
  newsletter: {
    backgroundColor: COLORS.primary.DEFAULT,
    color: COLORS.white,
  },
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BREAKPOINTS,
  DESIGN_TOKENS,
  DESIGN_GUIDELINES,
};
