// metro.config.js
// Fixes Firebase v11+ package resolution in Expo/RN by enabling package.json "exports".
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Firebase's internal packages (like @firebase/firestore) rely on package "exports".
config.resolver.unstable_enablePackageExports = true;

// Make Metro prefer the React Native export condition when a package uses "exports".
// Without this, some Firebase internals can resolve to the web build and break (e.g. auth not registered).
config.resolver.unstable_conditionNames = [
  "react-native",
  "browser",
  "require",
  "import",
  "default",
];

// Keep RN resolution predictable.
// Prefer "main" over "browser" for the Firebase v10 packages (their sub-packages don't use exports),
// otherwise Metro can pull the web ESM build and break native auth/firestore.
config.resolver.resolverMainFields = ["react-native", "main", "browser"];

module.exports = config;
