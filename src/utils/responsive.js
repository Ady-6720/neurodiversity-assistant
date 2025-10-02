// src/utils/responsive.js
import { Dimensions, Platform } from 'react-native';

/**
 * Get responsive size based on screen width
 * @param {number} small - Size for small screens (< 375px)
 * @param {number} medium - Size for medium screens (375-768px)
 * @param {number} large - Size for large screens (> 768px)
 * @returns {number} Appropriate size for current screen
 */
export const getResponsiveSize = (small, medium, large) => {
  const { width } = Dimensions.get('window');
  if (width < 375) return small;
  if (width < 768) return medium;
  return large;
};

/**
 * Get responsive width as percentage with max constraint
 * @param {number} percentage - Percentage of screen width (0-100)
 * @param {number} maxWidth - Maximum width in pixels
 * @returns {number|string} Width value
 */
export const getResponsiveWidth = (percentage = 100, maxWidth = null) => {
  const { width } = Dimensions.get('window');
  const calculatedWidth = (width * percentage) / 100;
  
  if (maxWidth) {
    return Math.min(calculatedWidth, maxWidth);
  }
  
  return calculatedWidth;
};

/**
 * Get responsive padding based on screen size
 * @returns {object} Padding values for different sizes
 */
export const getResponsivePadding = () => {
  const { width } = Dimensions.get('window');
  
  if (width < 375) {
    return {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
    };
  } else if (width < 768) {
    return {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
    };
  } else {
    return {
      xs: 6,
      sm: 12,
      md: 16,
      lg: 24,
      xl: 32,
    };
  }
};

/**
 * Get responsive font sizes
 * @returns {object} Font size values
 */
export const getResponsiveFontSize = () => {
  const { width } = Dimensions.get('window');
  
  if (width < 375) {
    return {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 20,
      xxl: 24,
    };
  } else if (width < 768) {
    return {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
    };
  } else {
    return {
      xs: 14,
      sm: 16,
      md: 18,
      lg: 20,
      xl: 28,
      xxl: 36,
    };
  }
};

/**
 * Check if current device is small screen
 * @returns {boolean}
 */
export const isSmallScreen = () => {
  const { width } = Dimensions.get('window');
  return width < 375;
};

/**
 * Check if current device is medium screen
 * @returns {boolean}
 */
export const isMediumScreen = () => {
  const { width } = Dimensions.get('window');
  return width >= 375 && width < 768;
};

/**
 * Check if current device is large screen (tablet)
 * @returns {boolean}
 */
export const isLargeScreen = () => {
  const { width } = Dimensions.get('window');
  return width >= 768;
};

/**
 * Get number of columns for grid layout
 * @param {number} minCardWidth - Minimum width for each card
 * @returns {number} Number of columns
 */
export const getGridColumns = (minCardWidth = 150) => {
  const { width } = Dimensions.get('window');
  const availableWidth = width - 32; // Account for padding
  return Math.max(1, Math.floor(availableWidth / minCardWidth));
};

/**
 * Get responsive card width for grid
 * @param {number} columns - Number of columns
 * @param {number} gap - Gap between cards
 * @returns {number} Card width
 */
export const getCardWidth = (columns = 2, gap = 12) => {
  const { width } = Dimensions.get('window');
  const totalGap = gap * (columns - 1);
  const availableWidth = width - 32 - totalGap; // Account for padding and gaps
  return availableWidth / columns;
};

/**
 * Get responsive icon size
 * @param {string} size - Size variant: 'small', 'medium', 'large'
 * @returns {number} Icon size in pixels
 */
export const getIconSize = (size = 'medium') => {
  const { width } = Dimensions.get('window');
  const isSmall = width < 375;
  
  const sizes = {
    small: isSmall ? 16 : 20,
    medium: isSmall ? 20 : 24,
    large: isSmall ? 28 : 32,
    xlarge: isSmall ? 40 : 48,
  };
  
  return sizes[size] || sizes.medium;
};

/**
 * Get responsive modal width
 * @returns {object} Modal width styles
 */
export const getModalWidth = () => {
  const { width } = Dimensions.get('window');
  
  if (width < 375) {
    return {
      width: '95%',
      maxWidth: width - 20,
    };
  } else if (width < 768) {
    return {
      width: '90%',
      maxWidth: 500,
    };
  } else {
    return {
      width: '80%',
      maxWidth: 600,
    };
  }
};

/**
 * Get responsive button height
 * @returns {number} Button height
 */
export const getButtonHeight = () => {
  return getResponsiveSize(44, 48, 52);
};

/**
 * Get responsive border radius
 * @param {string} size - Size variant: 'small', 'medium', 'large'
 * @returns {number} Border radius
 */
export const getBorderRadius = (size = 'medium') => {
  const { width } = Dimensions.get('window');
  const isSmall = width < 375;
  
  const radii = {
    small: isSmall ? 4 : 6,
    medium: isSmall ? 8 : 12,
    large: isSmall ? 12 : 16,
    xlarge: isSmall ? 16 : 20,
  };
  
  return radii[size] || radii.medium;
};

/**
 * Get screen dimensions
 * @returns {object} Width and height
 */
export const getScreenDimensions = () => {
  return Dimensions.get('window');
};

/**
 * Scale size based on screen width (useful for maintaining proportions)
 * @param {number} size - Base size (designed for 375px width)
 * @returns {number} Scaled size
 */
export const scale = (size) => {
  const { width } = Dimensions.get('window');
  const baseWidth = 375;
  return (width / baseWidth) * size;
};

/**
 * Moderate scale - scales less aggressively
 * @param {number} size - Base size
 * @param {number} factor - Scaling factor (0-1, default 0.5)
 * @returns {number} Scaled size
 */
export const moderateScale = (size, factor = 0.5) => {
  const { width } = Dimensions.get('window');
  const baseWidth = 375;
  return size + (scale(size) - size) * factor;
};

export default {
  getResponsiveSize,
  getResponsiveWidth,
  getResponsivePadding,
  getResponsiveFontSize,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  getGridColumns,
  getCardWidth,
  getIconSize,
  getModalWidth,
  getButtonHeight,
  getBorderRadius,
  getScreenDimensions,
  scale,
  moderateScale,
};
