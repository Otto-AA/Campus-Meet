// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

// eslint-disable-next-line no-undef
const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.assetExts.push("cjs");

// for e2e tests load detox-mock files instead of real file
if (process.env.DETOX) {
  defaultConfig.resolver.sourceExts.unshift(
    "detox-mock.js",
    "detox-mock.ts",
    "detox-mock.jsx",
    "detox-mock.tsx"
  );
}

// eslint-disable-next-line no-undef
module.exports = getDefaultConfig(__dirname);
