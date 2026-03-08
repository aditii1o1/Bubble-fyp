import jwt from "jsonwebtoken";

function signAccessToken(userId) {
  const secret = process.env.JWT_ACCESS_SECRET || "";
  if (!secret) throw new Error("Missing JWT_ACCESS_SECRET");
  return jwt.sign({ sub: String(userId) }, secret, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m"
  });
}

function signRefreshToken(userId) {
  const secret = process.env.JWT_REFRESH_SECRET || "";
  if (!secret) throw new Error("Missing JWT_REFRESH_SECRET");
  return jwt.sign({ sub: String(userId) }, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d"
  });
}

function verifyRefreshToken(token) {
  const secret = process.env.JWT_REFRESH_SECRET || "";
  if (!secret) throw new Error("Missing JWT_REFRESH_SECRET");
  return jwt.verify(token, secret);
}

export { signAccessToken, signRefreshToken, verifyRefreshToken };
