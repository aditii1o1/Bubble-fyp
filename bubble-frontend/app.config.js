const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath, override: false });
  }
}

module.exports = ({ config }) => {
  // Load the shared root .env first, then allow a local bubble-frontend/.env to override it.
  loadEnvFile(path.resolve(__dirname, "..", ".env"));
  loadEnvFile(path.resolve(__dirname, ".env"));

  const nextConfig = config || {};
  const extra = nextConfig.extra || {};

  return {
    ...nextConfig,
    extra: {
      ...extra,
      apiUrl: String(process.env.EXPO_PUBLIC_API_URL || extra.apiUrl || "").trim(),
      khaltiPublicKey: String(
        process.env.EXPO_PUBLIC_KHALTI_PUBLIC_KEY || extra.khaltiPublicKey || ""
      ).trim(),
      khaltiEnv: String(process.env.EXPO_PUBLIC_KHALTI_ENV || extra.khaltiEnv || "TEST").trim(),
      backendPublicUrl: String(
        process.env.BACKEND_PUBLIC_URL || process.env.BACKEND_PUBLIC_URLS || extra.backendPublicUrl || ""
      ).trim(),
      appDeeplinkUrl: String(process.env.APP_DEEPLINK_URL || extra.appDeeplinkUrl || "Bubble://").trim(),
    },
  };
};
