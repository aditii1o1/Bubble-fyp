import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { randomToken, sha256 } from "../utils/crypto.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { sendMail, bubbleEmailHtml, bubbleEmailText } from "../utils/mailer.js";

function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function getBackendUrl() {
  return (process.env.BACKEND_PUBLIC_URL || "http://localhost:4000").trim();
}

function getBackendUrls(req) {
  const urls = [];

  const legacy = (process.env.BACKEND_PUBLIC_URL || "").trim();
  if (legacy) urls.push(legacy);

  const list = (process.env.BACKEND_PUBLIC_URLS || "").trim();
  if (list) {
    for (const part of list.split(",")) {
      const value = String(part || "").trim();
      if (value) urls.push(value);
    }
  }

  const forwardedProto =
    typeof req?.headers?.["x-forwarded-proto"] === "string"
      ? req.headers["x-forwarded-proto"].split(",")[0].trim()
      : "";
  const forwardedHost =
    typeof req?.headers?.["x-forwarded-host"] === "string"
      ? req.headers["x-forwarded-host"].split(",")[0].trim()
      : "";
  const host = forwardedHost || (typeof req?.get === "function" ? req.get("host") : "");
  const proto = forwardedProto || req?.protocol || "";
  if (host && proto) urls.push(`${proto}://${host}`);

  const cleaned = urls
    .map((u) => String(u || "").trim().replace(/\/$/, ""))
    .filter((u) => u.startsWith("http://") || u.startsWith("https://"));

  const unique = Array.from(new Set(cleaned));
  unique.sort((a, b) => {
    const aIsTunnel = a.includes("devtunnels.ms");
    const bIsTunnel = b.includes("devtunnels.ms");
    if (aIsTunnel !== bIsTunnel) return aIsTunnel ? -1 : 1;

    const aIsHttps = a.startsWith("https://");
    const bIsHttps = b.startsWith("https://");
    if (aIsHttps !== bIsHttps) return aIsHttps ? -1 : 1;

    return 0;
  });

  return unique;
}

function getAppDeepLink() {
  return (process.env.APP_DEEPLINK_URL || "Bubble://").trim();
}

function buildLinkListText(urls, pathWithQuery) {
  const list = urls.map((base) => `${base}${pathWithQuery}`);
  if (list.length <= 1) return list[0] || "";
  return list.map((u) => `- ${u}`).join("\n");
}

function buildLinksForHtml(urls, pathWithQuery) {
  const list = urls.map((base) => `${base}${pathWithQuery}`);
  const primary = list[0] || "";
  const rest = list.slice(1);
  return {
    primary,
    links: rest.map((url) => ({ label: url, url }))
  };
}

async function issueTokens(user) {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  const decoded = verifyRefreshToken(refreshToken);

  await RefreshToken.create({
    userId: user._id,
    tokenHash: sha256(refreshToken),
    expiresAt: new Date(decoded.exp * 1000)
  });

  return { accessToken, refreshToken };
}

function toUserResponse(userDoc) {
  return {
    id: String(userDoc._id),
    email: userDoc.email,
    role: userDoc.role,
    banned: Boolean(userDoc.banned),
    emailVerified: Boolean(userDoc.emailVerified),
    onboarded: Boolean(userDoc.onboarded),
    username: userDoc.username || "",
    nickname: userDoc.nickname || "@anonymous",
    bio: userDoc.bio || "",
    avatar: userDoc.avatar || "cat",
    avatarUrl: userDoc.avatarUrl || null,
  };
}

function resetPageHtml({ token, errorMessage, successMessage }) {
  const backendUrl = getBackendUrl();
  const logoUrl = `${backendUrl}/static/logo.png`;
  const safeToken = typeof token === "string" ? token : "";
  const safeError = typeof errorMessage === "string" ? errorMessage : "";
  const safeSuccess = typeof successMessage === "string" ? successMessage : "";

  const showForm = Boolean(safeToken) && !safeSuccess;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Bubble • Reset password</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap" rel="stylesheet">
    <style>
      body { margin:0; padding:0; font-family: 'Lora', Georgia, 'Times New Roman', serif; background: linear-gradient(135deg,#FFF9F5,#FFE8ED); }
      .wrap { padding: 28px 16px; }
      .card { max-width: 520px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0E0E0; border-radius: 20px; overflow: hidden; }
      .bar { height: 10px; background: linear-gradient(90deg,#FF8FAB,#FFC2D1); }
      .content { padding: 22px; }
      .logo { display:block; margin: 10px auto 0; height: 38px; width: auto; }
      .title { font-size: 20px; font-weight: 700; color: #333333; margin: 14px 0 8px; text-align:center; }
      .subtitle { font-size: 14px; line-height: 22px; color: #444444; margin: 0 0 18px; text-align:center; }
      .error { background:#FFF1F2; border:1px solid #FFCCD5; color:#9F1239; padding: 12px 14px; border-radius: 14px; font-size: 13px; margin-bottom: 14px; }
      .success { background:#ECFDF5; border:1px solid #BBF7D0; color:#065F46; padding: 12px 14px; border-radius: 14px; font-size: 13px; margin-bottom: 14px; }
      label { display:block; font-size: 13px; color:#333333; margin: 10px 0 6px; }
      input { width: 100%; box-sizing: border-box; padding: 12px 12px; border-radius: 14px; border: 1px solid #E0E0E0; font-size: 14px; }
      .btn { display:inline-block; border: none; cursor:pointer; background:#FF8FAB; color:#FFFFFF; text-decoration:none; padding: 12px 16px; border-radius: 14px; font-weight: 700; font-size: 14px; }
      .btn-row { margin-top: 16px; display:flex; gap: 10px; flex-wrap: wrap; align-items:center; justify-content:center; }
      .muted { font-size: 12px; line-height: 18px; color:#888888; margin-top: 12px; text-align:center; }
      @media only screen and (max-width: 420px) {
        .content { padding: 18px; }
        .title { font-size: 18px; }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div class="bar"></div>
        <div class="content">
          <img class="logo" src="${logoUrl}" alt="Bubble" onerror="this.style.display='none'"/>
          <div class="title">Reset your password</div>
          <div class="subtitle">Choose a new password for your Bubble account.</div>
          ${safeError ? `<div class="error">${safeError}</div>` : ""}
          ${safeSuccess ? `<div class="success">${safeSuccess}</div>` : ""}
          ${
            showForm
              ? `<form method="POST" action="/api/auth/reset-password-form">
                  <input type="hidden" name="token" value="${safeToken}" />
                  <label>New password</label>
                  <input type="password" name="password" minlength="6" required placeholder="At least 6 characters" />
                  <label>Confirm password</label>
                  <input type="password" name="confirmPassword" minlength="6" required placeholder="Re-type your password" />
                  <div class="btn-row">
                    <button class="btn" type="submit">Update Password</button>
                  </div>
                </form>`
              : `<div class="btn-row">
                  <a class="btn" href="${getAppDeepLink()}">Open Bubble</a>
                </div>`
          }
          <div class="muted">If you didn’t request this, you can close this tab.</div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function verifyPageHtml({ title, subtitle }) {
  const backendUrl = getBackendUrl();
  const logoUrl = `${backendUrl}/static/logo.png`;
  const safeTitle = typeof title === "string" ? title : "Verified";
  const safeSubtitle = typeof subtitle === "string" ? subtitle : "";
  const appUrl = getAppDeepLink();

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Bubble • ${safeTitle}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap" rel="stylesheet">
    <style>
      body { margin:0; padding:0; font-family: 'Lora', Georgia, 'Times New Roman', serif; background: linear-gradient(135deg,#FFF9F5,#FFE8ED); }
      .wrap { padding: 28px 16px; }
      .card { max-width: 560px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0E0E0; border-radius: 22px; overflow: hidden; }
      .bar { height: 10px; background: linear-gradient(90deg,#FF8FAB,#FFC2D1); }
      .content { padding: 24px 22px; text-align:center; }
      .logo { display:block; margin: 10px auto 12px; height: 44px; width: auto; }
      .badge { display:inline-block; padding: 6px 12px; border-radius: 999px; background:#FFF1F2; border:1px solid #FFCCD5; color:#9F1239; font-size: 12px; }
      .title { font-size: 22px; font-weight: 700; color: #333333; margin: 14px 0 10px; }
      .subtitle { font-size: 14px; line-height: 22px; color: #444444; margin: 0 auto 18px; max-width: 44ch; }
      .btn { display:inline-block; border: none; cursor:pointer; background:#FF8FAB; color:#FFFFFF; text-decoration:none; padding: 12px 18px; border-radius: 14px; font-weight: 700; font-size: 14px; }
      .muted { font-size: 12px; line-height: 18px; color:#888888; margin-top: 14px; }
      @media only screen and (max-width: 420px) {
        .content { padding: 20px 16px; }
        .title { font-size: 20px; }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div class="bar"></div>
        <div class="content">
          <img class="logo" src="${logoUrl}" alt="Bubble" onerror="this.style.display='none'"/>
          <div class="badge">Bubble</div>
          <div class="title">${safeTitle}</div>
          <div class="subtitle">${safeSubtitle}</div>
          <a class="btn" href="${appUrl}">Open Bubble</a>
          <div class="muted">You can close this tab.</div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

const authController = {
  register: async (req, res, next) => {
    try {
      const email =
        typeof req.body?.email === "string"
          ? req.body.email.trim().toLowerCase()
          : "";
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      if (!email) return res.status(400).json({ message: "Email is required" });
      if (!password || password.length < 6)
        return res.status(400).json({ message: "Password must be at least 6 characters" });

      const existingUser = await User.findOne({ email }).lean();
      if (existingUser) return res.status(400).json({ message: "Email already in use" });

      const passwordHash = await bcrypt.hash(password, 10);

      const verifyToken = randomToken(32);
      const verifyTokenHash = sha256(verifyToken);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

      const adminEmails = getAdminEmails();
      const role = adminEmails.includes(email) ? "admin" : "user";

      const user = await User.create({
        email,
        passwordHash,
        role,
        emailVerified: false,
        verifyEmailTokenHash: verifyTokenHash,
        verifyEmailTokenExpiresAt: expiresAt,
        onboarded: false,
        usernameSet: false,
        nickname: "@anonymous",
        bio: "",
        avatar: "cat",
        avatarUrl: null
      });

      const backendUrls = getBackendUrls(req);
      const verifyPath = `/api/auth/verify-email?token=${verifyToken}`;
      const chosenBaseUrls = backendUrls.length ? backendUrls : [getBackendUrl()];
      const verifyLinkText = buildLinkListText(chosenBaseUrls, verifyPath);
      const verifyLinkHtml = buildLinksForHtml(chosenBaseUrls, verifyPath);
      await sendMail({
        to: email,
        subject: "Verify your Bubble email",
        text: bubbleEmailText({
          title: "Verify your email",
          subtitle: "Welcome to Bubble. Verify your email to start posting.",
          buttonUrl: verifyLinkText,
          footer: "This link expires in 24 hours."
        }),
        html: bubbleEmailHtml({
          title: "Verify your email",
          subtitle: "Welcome to Bubble. Tap below to verify your email and start posting.",
          buttonText: "Verify Email",
          buttonUrl: verifyLinkHtml.primary,
          links: verifyLinkHtml.links,
          footer: "This link expires in 24 hours."
        }),
      });

      return res.status(201).json({ user: toUserResponse(user) });
    } catch (e) {
      return next(e);
    }
  },

  verifyEmail: async (req, res, next) => {
    try {
      const token = typeof req.query?.token === "string" ? req.query.token.trim() : "";
      if (!token) return res.status(400).send("Missing token");
      const tokenHash = sha256(token);

      const user = await User.findOne({
        verifyEmailTokenHash: tokenHash,
        verifyEmailTokenExpiresAt: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).send("Invalid or expired verification link.");
      }

      user.emailVerified = true;
      user.verifyEmailTokenHash = null;
      user.verifyEmailTokenExpiresAt = null;
      await user.save();

      return res
        .status(200)
        .send(
          verifyPageHtml({
            title: "Email verified",
            subtitle: "You’re all set. Go back to the Bubble app and sign in."
          })
        );
    } catch (e) {
      return next(e);
    }
  },

  login: async (req, res, next) => {
    try {
      const email =
        typeof req.body?.email === "string"
          ? req.body.email.trim().toLowerCase()
          : "";
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

      const userDoc = await User.findOne({ email });
      if (!userDoc) return res.status(400).json({ message: "Wrong email or password" });
      if (userDoc.banned) return res.status(403).json({ message: "Account restricted" });

      const ok = await bcrypt.compare(password, userDoc.passwordHash);
      if (!ok) return res.status(400).json({ message: "Wrong email or password" });

      if (!userDoc.emailVerified) {
        return res.status(403).json({ message: "Email not verified. Please verify your email first." });
      }

      const tokens = await issueTokens(userDoc);
      return res.json({ user: toUserResponse(userDoc), ...tokens });
    } catch (e) {
      return next(e);
    }
  },

  refresh: async (req, res, next) => {
    try {
      const refreshToken =
        typeof req.body?.refreshToken === "string" ? req.body.refreshToken.trim() : "";
      if (!refreshToken) return res.status(400).json({ message: "Missing refresh token" });

      let decoded;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const tokenHash = sha256(refreshToken);
      const savedToken = await RefreshToken.findOne({ tokenHash });
      if (!savedToken || savedToken.revokedAt) return res.status(401).json({ message: "Refresh token revoked" });
      if (savedToken.expiresAt <= new Date()) return res.status(401).json({ message: "Refresh token expired" });

      const userDoc = await User.findById(decoded.sub);
      if (!userDoc) return res.status(401).json({ message: "User not found" });
      if (userDoc.banned) return res.status(403).json({ message: "Account restricted" });

      savedToken.revokedAt = new Date();
      await savedToken.save();

      const tokens = await issueTokens(userDoc);
      return res.json({ ...tokens });
    } catch (e) {
      return next(e);
    }
  },

  logout: async (req, res, next) => {
    try {
      const refreshToken =
        typeof req.body?.refreshToken === "string" ? req.body.refreshToken.trim() : "";
      if (refreshToken) {
        await RefreshToken.updateOne({ tokenHash: sha256(refreshToken) }, { $set: { revokedAt: new Date() } });
      }
      return res.json({ ok: true });
    } catch (e) {
      return next(e);
    }
  },

  requestPasswordReset: async (req, res, next) => {
    try {
      const email =
        typeof req.body?.email === "string"
          ? req.body.email.trim().toLowerCase()
          : "";
      if (!email) return res.status(400).json({ message: "Email is required" });

      const userDoc = await User.findOne({ email });
      if (!userDoc) return res.json({ ok: true });

      const resetToken = randomToken(32);
      userDoc.resetPasswordTokenHash = sha256(resetToken);
      userDoc.resetPasswordTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
      await userDoc.save();

      const backendUrls = getBackendUrls(req);
      const resetPath = `/api/auth/reset-password?token=${resetToken}`;
      const chosenBaseUrls = backendUrls.length ? backendUrls : [getBackendUrl()];
      const resetLinkText = buildLinkListText(chosenBaseUrls, resetPath);
      const resetLinkHtml = buildLinksForHtml(chosenBaseUrls, resetPath);
      await sendMail({
        to: email,
        subject: "Reset your Bubble password",
        text: bubbleEmailText({
          title: "Reset password",
          subtitle: "Use the link below to reset your Bubble password.",
          buttonUrl: resetLinkText,
          footer: "This link expires in 30 minutes."
        }),
        html: bubbleEmailHtml({
          title: "Reset password",
          subtitle: "Tap below to reset your Bubble password.",
          buttonText: "Reset Password",
          buttonUrl: resetLinkHtml.primary,
          links: resetLinkHtml.links,
          footer: "This link expires in 30 minutes."
        }),
      });

      return res.json({ ok: true });
    } catch (e) {
      return next(e);
    }
  },

  resetPasswordPage: async (req, res, next) => {
    try {
      const token = typeof req.query?.token === "string" ? req.query.token.trim() : "";
      if (!token) {
        return res.status(400).send(
          resetPageHtml({
            token: "",
            errorMessage: "Missing reset token. Please open the link from your email again."
          })
        );
      }
      return res.status(200).send(resetPageHtml({ token }));
    } catch (e) {
      return next(e);
    }
  },

  resetPasswordForm: async (req, res, next) => {
    try {
      const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      const confirmPassword =
        typeof req.body?.confirmPassword === "string" ? req.body.confirmPassword : "";

      if (!token) {
        return res.status(400).send(
          resetPageHtml({
            token: "",
            errorMessage: "Missing reset token. Please open the link from your email again."
          })
        );
      }

      if (!password || password.length < 6) {
        return res.status(400).send(
          resetPageHtml({
            token,
            errorMessage: "Password must be at least 6 characters."
          })
        );
      }

      if (password !== confirmPassword) {
        return res.status(400).send(
          resetPageHtml({
            token,
            errorMessage: "Passwords do not match."
          })
        );
      }

      const user = await User.findOne({
        resetPasswordTokenHash: sha256(token),
        resetPasswordTokenExpiresAt: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).send(
          resetPageHtml({
            token: "",
            errorMessage: "Invalid or expired reset link. Request a new one from the app."
          })
        );
      }

      user.passwordHash = await bcrypt.hash(password, 10);
      user.resetPasswordTokenHash = null;
      user.resetPasswordTokenExpiresAt = null;
      await user.save();

      return res.status(200).send(
        resetPageHtml({
          token: "",
          successMessage: "Password updated. You can now sign in with your new password."
        })
      );
    } catch (e) {
      return next(e);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      if (!token) return res.status(400).json({ message: "Missing token" });
      if (!password || password.length < 6)
        return res.status(400).json({ message: "Password must be at least 6 characters" });

      const user = await User.findOne({
        resetPasswordTokenHash: sha256(token),
        resetPasswordTokenExpiresAt: { $gt: new Date() }
      });
      if (!user) return res.status(400).json({ message: "Invalid or expired token" });

      user.passwordHash = await bcrypt.hash(password, 10);
      user.resetPasswordTokenHash = null;
      user.resetPasswordTokenExpiresAt = null;
      await user.save();

      return res.json({ ok: true });
    } catch (e) {
      return next(e);
    }
  }
};

export { authController };
