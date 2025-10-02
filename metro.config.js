const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable the experimental package exports feature to fix Firebase auth initialization
config.resolver.unstable_enablePackageExports = false;

// Add 'cjs' to source extensions for better compatibility
config.resolver.sourceExts.push('cjs');

module.exports = config;
