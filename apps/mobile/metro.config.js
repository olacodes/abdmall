// Expo (SDK 52+) auto-configures Metro for monorepos, so no manual
// watchFolders / nodeModulesPaths are needed. We only wrap it with NativeWind.
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./src/global.css" });
