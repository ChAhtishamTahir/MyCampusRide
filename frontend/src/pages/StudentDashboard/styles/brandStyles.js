/**
 * Brand Styling Constants for Student Portal
 *
 * This file contains all brand colors, gradients, and styling constants
 * to ensure consistency with the landing page design across the entire
 * student portal. These values are identical to the admin portal and
 * landing page for complete brand cohesion.
 *
 * IMPORTANT: These values must match the landing page exactly.
 * Do not modify without updating other portals first.
 */

// ============================================================================
// PRIMARY BRAND COLORS
// ============================================================================

export const BRAND_COLORS = {
  // Primary gradient used for CTAs, active states, and brand elements
  primaryGradient: 'linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)',
  primaryGradientHover: 'linear-gradient(135deg, #0284C7 0%, #0F766E 100%)',

  // Individual brand colors
  skyBlue: '#0EA5E9',          // Primary blue for interactive elements
  skyBlueDark: '#0284C7',      // Darker blue for hover states
  teal: '#14B8A6',             // Secondary teal for accents
  tealDark: '#0F766E',         // Darker teal for hover states

  // Student-specific color (from landing page - blue variant)
  studentBlue: '#0EA5E9',      // Student portal primary color
  studentBlueDark: '#0284C7',  // Darker for hover states

  // Success, warning, error
  successGreen: '#10B981',     // Success states, checkmarks
  warningOrange: '#F59E0B',    // Warning states
  errorRed: '#EF4444',         // Error states

  // Neutral slate colors for text and backgrounds
  slate900: '#0F172A',         // Headings, primary text
  slate700: '#334155',         // Secondary headings
  slate600: '#64748B',         // Body text, captions
  slate500: '#94A3B8',         // Disabled states
  slate400: '#CBD5E1',         // Borders, dividers
  slate300: '#E2E8F0',         // Light borders
  slate200: '#F1F5F9',         // Light backgrounds
  slate100: '#F8FAFC',         // Very light backgrounds

  // Pure colors
  white: '#FFFFFF',
  black: '#000000',
};

// ============================================================================
// BACKGROUND GRADIENTS
// ============================================================================

export const BACKGROUND_GRADIENTS = {
  // Main page background (light blue to white)
  page: 'linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%)',

  // Card hover effect
  cardHover: 'linear-gradient(135deg, rgba(14, 165, 233, 0.04) 0%, rgba(20, 184, 166, 0.04) 100%)',

  // Subtle background for sections
  sectionLight: 'linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%)',

  // Student-specific gradient
  studentGradient: 'linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)',
};

// ============================================================================
// SHADOWS
// ============================================================================

export const SHADOWS = {
  // Small shadow for subtle elevation
  sm: '0 2px 8px rgba(0, 0, 0, 0.08)',

  // Medium shadow for cards
  md: '0 4px 16px rgba(0, 0, 0, 0.08)',

  // Large shadow for elevated elements
  lg: '0 8px 24px rgba(0, 0, 0, 0.12)',

  // Extra large shadow for modals/popovers
  xl: '0 20px 60px rgba(0, 0, 0, 0.08)',

  // Button shadows with brand color tint
  buttonDefault: '0 8px 24px rgba(14, 165, 233, 0.35)',
  buttonHover: '0 12px 32px rgba(14, 165, 233, 0.45)',

  // Card hover with brand tint
  cardBrand: '0 8px 24px rgba(14, 165, 233, 0.15)',
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BORDER_RADIUS = {
  xs: '4px',      // Very small, for progress bars
  sm: '8px',      // Small, for chips/badges
  md: '12px',     // Medium, for inputs/buttons
  lg: '16px',     // Large, for cards
  xl: '18px',     // Extra large, for icon boxes
  '2xl': '20px',  // 2X large, for major cards
  full: '50%',    // Full circle
};

// ============================================================================
// SPACING
// ============================================================================

// Using Material-UI's 8px spacing system
export const SPACING = {
  xs: 0.5,   // 4px
  sm: 1,     // 8px
  md: 2,     // 16px
  lg: 3,     // 24px
  xl: 4,     // 32px
  '2xl': 6,  // 48px
  '3xl': 8,  // 64px
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const TYPOGRAPHY = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",

  // Font weights
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
    loose: 1.8,
  },

  // Letter spacing
  letterSpacing: {
    tight: '-0.5px',
    normal: '0',
    wide: '0.5px',
  },
};

// ============================================================================
// BUTTON STYLES
// ============================================================================

export const BUTTON_STYLES = {
  // Primary gradient button (matching landing page CTAs)
  primary: {
    background: BRAND_COLORS.primaryGradient,
    color: BRAND_COLORS.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
    borderRadius: BORDER_RADIUS.md,
    boxShadow: SHADOWS.buttonDefault,
    textTransform: 'none',
    padding: '12px 24px',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: BRAND_COLORS.primaryGradientHover,
      boxShadow: SHADOWS.buttonHover,
      transform: 'translateY(-2px)',
    },
    '&:disabled': {
      background: BRAND_COLORS.slate500,
      color: BRAND_COLORS.white,
      boxShadow: 'none',
    },
  },

  // Secondary outlined button
  secondary: {
    borderColor: BRAND_COLORS.skyBlue,
    color: BRAND_COLORS.skyBlue,
    fontWeight: TYPOGRAPHY.weights.semibold,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: '2px',
    textTransform: 'none',
    padding: '12px 24px',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: BRAND_COLORS.skyBlueDark,
      bgcolor: 'rgba(14, 165, 233, 0.08)',
      borderWidth: '2px',
    },
  },

  // Student-specific button
  student: {
    background: BACKGROUND_GRADIENTS.studentGradient,
    color: BRAND_COLORS.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
    borderRadius: BORDER_RADIUS.md,
    boxShadow: '0 8px 24px rgba(14, 165, 233, 0.35)',
    textTransform: 'none',
    '&:hover': {
      background: BRAND_COLORS.primaryGradientHover,
      boxShadow: '0 12px 32px rgba(14, 165, 233, 0.45)',
      transform: 'translateY(-2px)',
    },
  },
};

// ============================================================================
// INPUT FIELD STYLES
// ============================================================================

export const INPUT_STYLES = {
  // Standard text field styling (matching auth pages)
  standard: {
    '& .MuiOutlinedInput-root': {
      borderRadius: BORDER_RADIUS.md,
      '&:hover fieldset': {
        borderColor: BRAND_COLORS.skyBlue,
      },
      '&.Mui-focused fieldset': {
        borderColor: BRAND_COLORS.skyBlue,
        borderWidth: '2px',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: BRAND_COLORS.skyBlue,
    },
  },
};

// ============================================================================
// CARD STYLES
// ============================================================================

export const CARD_STYLES = {
  // Standard card (matching auth pages)
  standard: {
    borderRadius: BORDER_RADIUS.lg,
    boxShadow: SHADOWS.md,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: SHADOWS.cardBrand,
      transform: 'translateY(-2px)',
    },
  },

  // Stat card with gradient
  stat: {
    borderRadius: BORDER_RADIUS.lg,
    background: BRAND_COLORS.primaryGradient,
    color: BRAND_COLORS.white,
    boxShadow: SHADOWS.buttonDefault,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: SHADOWS.buttonHover,
      transform: 'translateY(-4px)',
    },
  },

  // Large container card
  container: {
    borderRadius: BORDER_RADIUS['2xl'],
    boxShadow: SHADOWS.lg,
    border: `1px solid ${BRAND_COLORS.slate300}`,
  },
};

// ============================================================================
// SIDEBAR STYLES
// ============================================================================

export const SIDEBAR_STYLES = {
  width: 280,

  // Brand logo section
  logo: {
    fontWeight: TYPOGRAPHY.weights.extrabold,
    fontSize: '1.25rem',
    background: BRAND_COLORS.primaryGradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },

  // Menu item active state
  menuItemActive: {
    borderRadius: BORDER_RADIUS.md,
    background: BRAND_COLORS.primaryGradient,
    color: BRAND_COLORS.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // Menu item hover state
  menuItemHover: {
    borderRadius: BORDER_RADIUS.md,
    bgcolor: 'rgba(14, 165, 233, 0.08)',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a glassmorphism effect
 * @param {number} blur - Blur amount in px
 * @param {number} opacity - Background opacity (0-1)
 * @returns {object} - Style object for glassmorphism
 */
export const glassmorphism = (blur = 10, opacity = 0.95) => ({
  backdropFilter: `blur(${blur}px)`,
  background: `rgba(255, 255, 255, ${opacity})`,
  border: '1px solid rgba(255, 255, 255, 0.8)',
});

/**
 * Creates a gradient text effect
 * @returns {object} - Style object for gradient text
 */
export const gradientText = () => ({
  background: BRAND_COLORS.primaryGradient,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});

/**
 * Creates a hover lift effect
 * @param {number} amount - Amount to lift in px
 * @returns {object} - Style object for hover effect
 */
export const hoverLift = (amount = 2) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: `translateY(-${amount}px)`,
  },
});

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  BRAND_COLORS,
  BACKGROUND_GRADIENTS,
  SHADOWS,
  BORDER_RADIUS,
  SPACING,
  TYPOGRAPHY,
  BUTTON_STYLES,
  INPUT_STYLES,
  CARD_STYLES,
  SIDEBAR_STYLES,
  glassmorphism,
  gradientText,
  hoverLift,
};
