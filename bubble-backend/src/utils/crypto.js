import crypto from "crypto";

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

function sha256(text) {
  return crypto.createHash("sha256").update(String(text)).digest("hex");
}

export { randomToken, sha256 };
