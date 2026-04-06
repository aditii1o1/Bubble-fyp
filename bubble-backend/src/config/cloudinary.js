import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function getCloudinaryConfig() {
  const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const apiKey = String(process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = String(process.env.CLOUDINARY_API_SECRET || "").trim();
  const enabled = Boolean(cloudName && apiKey && apiSecret);

  if (enabled && !configured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    configured = true;
  }

  return { enabled };
}

export { cloudinary };
