// src/config/theme.js

// Soothing colors optimized for autism and ADHD with better contrast
const colors = {
    // Primary colors
    primary: '#4A90E2',    // Deeper Sky Blue - Main brand color
    secondary: '#7FB069',  // Deeper Sage Green - Secondary brand color
    tertiary: '#9B7BB8',   // Deeper Lavender - Tertiary brand color

    // Background colors
    background: '#F8FAFC', // Very Light Blue-Grey
    surface: '#FFFFFF',    // Pure White
    cardBg: '#F1F5F9',    // Soft Grey-Blue

    // Accent colors
    accent1: '#A8D5BA',   // Deeper Aqua
    accent2: '#B8C9B8',   // Deeper Grey-Green
    accent3: '#D1D5DB',   // Deeper Grey

    // Text colors
    text: '#1F2937',      // Darker Blue-Grey for better contrast
    subtext: '#4B5563',   // Darker Grey-Blue for better contrast

    // Functional colors
    success: '#10B981',   // Brighter Green
    warning: '#F59E0B',   // Brighter Orange
    error: '#EF4444',     // Brighter Red
    info: '#3B82F6',      // Brighter Blue

    // Category colors
    focus: '#6366F1',     // Deeper Blue
    memory: '#10B981',    // Deeper Green
    planning: '#059669',  // Deeper Sage
    impulse: '#D97706',   // Deeper Beige

    // Interactive elements
    buttonBg: '#6B7280',  // Deeper Grey
    buttonText: '#FFFFFF', // White
    highlight: '#DBEAFE',  // Deeper Light Blue
};

const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
};

const typography = {
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 22,
        xxl: 26,
    },
    weights: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
    families: {
        regular: 'System',
        heading: 'System',
    },
};

const shapes = {
    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        round: 9999,
    },
    buttonHeight: 48,
    iconSize: {
        sm: 16,
        md: 24,
        lg: 32,
        xl: 40,
    },
};

const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
};

export { colors, spacing, typography, shapes, shadows };