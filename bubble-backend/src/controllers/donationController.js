import { Donation } from "../models/Donation.js";
import { paisaToNpr, serializeDonation } from "../utils/donations.js";

function normalizeBaseUrl(url) {
  return String(url || "").trim().replace(/\/+$/, "");
}

function isLoopbackUrl(url) {
  const normalized = normalizeBaseUrl(url).toLowerCase();
  return /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?(?:\/|$)/.test(
    normalized
  );
}

function preferReachableUrl(configuredUrl, fallbackUrl) {
  const configured = normalizeBaseUrl(configuredUrl);
  const fallback = normalizeBaseUrl(fallbackUrl);

  if (!configured) return fallback;
  if (fallback && isLoopbackUrl(configured) && !isLoopbackUrl(fallback)) {
    return fallback;
  }
  return configured;
}

function parseAmount(value) {
  const amount =
    typeof value === "number"
      ? value
      : Number(String(value || "").replace(/,/g, "").trim());
  return Number.isFinite(amount) ? amount : null;
}

function getKhaltiEnvironment() {
  const raw = String(
    process.env.KHALTI_ENV || process.env.EXPO_PUBLIC_KHALTI_ENV || "TEST"
  )
    .trim()
    .toUpperCase();

  return ["LIVE", "PROD", "PRODUCTION"].includes(raw) ? "PROD" : "TEST";
}

function getKhaltiConfig() {
  const environment = getKhaltiEnvironment();
  const backendPublicUrl = normalizeBaseUrl(
    process.env.BACKEND_PUBLIC_URL || process.env.BACKEND_PUBLIC_URLS
  );
  return {
    environment,
    baseUrl:
      environment === "PROD"
        ? "https://khalti.com/api/v2"
        : "https://dev.khalti.com/api/v2",
    secretKey: String(process.env.KHALTI_SECRET_KEY || "").trim(),
    websiteUrl: preferReachableUrl(process.env.KHALTI_WEBSITE_URL, backendPublicUrl),
    returnUrl: preferReachableUrl(
      process.env.KHALTI_RETURN_URL,
      backendPublicUrl ? `${backendPublicUrl}/payment/callback` : ""
    ),
  };
}

function isKhaltiDebugEnabled() {
  return ["1", "true", "yes", "on"].includes(
    String(process.env.KHALTI_DEBUG || "")
      .trim()
      .toLowerCase()
  );
}

function maskSecret(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.length <= 8) return `${raw.slice(0, 2)}***${raw.slice(-2)}`;
  return `${raw.slice(0, 4)}***${raw.slice(-4)}`;
}

function logKhalti(event, payload = null) {
  if (!isKhaltiDebugEnabled()) return;
  const stamp = new Date().toISOString();
  if (payload === null || typeof payload === "undefined") {
    console.log(`[KHALTI][${stamp}] ${event}`);
    return;
  }
  console.log(`[KHALTI][${stamp}] ${event}`, payload);
}

function getDeepLinkBase() {
  const raw = String(process.env.APP_DEEPLINK_URL || "Bubble://").trim();
  if (!raw) return "Bubble://";
  const scheme = raw.split("://")[0].replace(/:$/, "");
  return `${scheme}://`;
}

function toPaisa(amountNpr) {
  if (!Number.isFinite(amountNpr)) return null;
  return Math.round(amountNpr * 100);
}

function extractKhaltiMessage(payload) {
  if (!payload) return "Khalti API error";
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    return trimmed || "Khalti API error";
  }
  if (Array.isArray(payload)) {
    return payload.map((item) => extractKhaltiMessage(item)).filter(Boolean).join(" ");
  }
  if (typeof payload === "object") {
    if (typeof payload.detail === "string" && payload.detail.trim()) {
      return payload.detail.trim();
    }
    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message.trim();
    }
    for (const [key, value] of Object.entries(payload)) {
      if (key === "error_key") continue;
      const nested = extractKhaltiMessage(value);
      if (nested) return nested;
    }
  }
  return "Khalti API error";
}

function withKhaltiAuthHint(message) {
  const baseMessage = String(message || "Khalti API error").trim() || "Khalti API error";
  return `${baseMessage} Check that KHALTI_SECRET_KEY is the merchant secret from test-admin.khalti.com and that it matches KHALTI_ENV.`;
}

async function khaltiFetch(path, payload) {
  if (typeof fetch !== "function") {
    const err = new Error("Server requires Node 18+ fetch support.");
    err.status = 500;
    throw err;
  }

  const { baseUrl, secretKey } = getKhaltiConfig();

  if (!secretKey) {
    const err = new Error("KHALTI_SECRET_KEY is not configured.");
    err.status = 500;
    throw err;
  }

  logKhalti("request", {
    path,
    baseUrl,
    environment: getKhaltiEnvironment(),
    hasSecretKey: Boolean(secretKey),
    maskedSecretKey: maskSecret(secretKey),
    payload,
  });

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `key ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  logKhalti("response", {
    path,
    status: response.status,
    ok: response.ok,
    data,
  });

  if (!response.ok) {
    const message = extractKhaltiMessage(data);
    const err = new Error(
      response.status === 401 ? withKhaltiAuthHint(message) : message
    );
    err.status = response.status;
    err.payload = data;
    throw err;
  }

  return data;
}

function buildCallbackDeepLink(query) {
  const params = new URLSearchParams();
  const pidx = String(query?.pidx || "").trim();
  const status = String(query?.status || "").trim();
  const transactionId = String(query?.transaction_id || query?.tidx || "").trim();

  if (pidx) params.set("pidx", pidx);
  if (status) params.set("status", status);
  if (transactionId) params.set("transactionId", transactionId);

  const search = params.toString();
  return `${getDeepLinkBase()}donate/result${search ? `?${search}` : ""}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function callbackPageHtml(query) {
  const status = escapeHtml(String(query?.status || "Pending").trim());
  const pidx = escapeHtml(String(query?.pidx || "").trim());
  const transactionId = escapeHtml(
    String(query?.transaction_id || query?.tidx || "").trim()
  );
  const deepLink = buildCallbackDeepLink(query);
  const escapedDeepLink = escapeHtml(deepLink);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Bubble Payment Callback</title>
    <style>
      body { margin: 0; font-family: Arial, sans-serif; background: #fff7f3; color: #333; }
      .wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
      .card { width: 100%; max-width: 520px; background: #fff; border: 1px solid #f0d7df; border-radius: 20px; padding: 28px; box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08); }
      h1 { margin: 0 0 12px; font-size: 24px; }
      p { margin: 0 0 12px; line-height: 1.5; }
      .meta { margin-top: 16px; padding: 14px; border-radius: 14px; background: #fff2f6; font-size: 14px; }
      .button { display: inline-block; margin-top: 20px; background: #5c2d91; color: #fff; text-decoration: none; padding: 12px 18px; border-radius: 999px; font-weight: 700; }
      .hint { margin-top: 16px; font-size: 13px; color: #666; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <h1>Return to Bubble</h1>
        <p>Khalti has redirected here after payment. Bubble will verify the payment inside the app before showing the final donation result.</p>
        <div class="meta">
          <div><strong>Status:</strong> ${status || "Unknown"}</div>
          <div><strong>PIDX:</strong> ${pidx || "Unavailable"}</div>
          <div><strong>Transaction ID:</strong> ${transactionId || "Unavailable"}</div>
        </div>
        <a class="button" href="${escapedDeepLink}">Open Bubble</a>
        <p class="hint">If the app does not open automatically, return to Bubble and your donation can still be verified there using the saved payment id.</p>
      </div>
    </div>
    <script>
      (function () {
        var target = ${JSON.stringify(deepLink)};
        if (!target) return;
        setTimeout(function () {
          window.location.href = target;
        }, 250);
      })();
    </script>
  </body>
</html>`;
}

async function saveInitiatedDonation({ user, donorName, amount, purchaseOrderId, pidx }) {
  const payload = {
    provider: "khalti",
    status: "Initiated",
    userId: user._id,
    userEmail: user.email || "",
    userNickname: user.nickname || "",
    userUsername: user.username || "",
    donorName,
    amount,
    currency: "NPR",
    purchaseOrderId,
    purchaseOrderName: "Bubble Donation",
    pidx,
  };

  await Donation.updateOne({ pidx }, { $set: payload }, { upsert: true });
}

const donationController = {
  initiate: async (req, res, next) => {
    try {
      const amountNpr = parseAmount(req.body?.amount);
      const donorName = String(req.body?.name || "").trim();
      const email = String(req.user?.email || req.body?.email || "").trim().toLowerCase();

      if (!Number.isFinite(amountNpr) || amountNpr < 10) {
        return res.status(400).json({ message: "Minimum donation is NPR 10." });
      }
      if (!donorName) {
        return res.status(400).json({ message: "Name is required." });
      }
      if (!email.includes("@")) {
        return res.status(400).json({ message: "A valid email is required." });
      }

      const amountPaisa = toPaisa(amountNpr);
      if (!Number.isFinite(amountPaisa) || amountPaisa < 1000) {
        return res.status(400).json({ message: "Amount must be at least NPR 10." });
      }

      const purchaseOrderId = `donation_${String(req.user?._id || "user")}_${Date.now()}`;
      const { websiteUrl, returnUrl } = getKhaltiConfig();
      logKhalti("initiate.start", {
        userId: String(req.user?._id || ""),
        email,
        donorName,
        amountNpr,
        websiteUrl,
        returnUrl,
      });
      if (!websiteUrl) {
        return res.status(500).json({ message: "KHALTI_WEBSITE_URL is not configured." });
      }
      if (!returnUrl) {
        return res.status(500).json({ message: "KHALTI_RETURN_URL is not configured." });
      }

      const data = await khaltiFetch("/epayment/initiate/", {
        return_url: returnUrl,
        website_url: websiteUrl,
        amount: amountPaisa,
        purchase_order_id: purchaseOrderId,
        purchase_order_name: "Bubble Donation",
        customer_info: {
          name: donorName,
          email,
        },
      });

      const pidx = String(data?.pidx || "").trim();
      if (!pidx) {
        const err = new Error("Khalti did not return a payment identifier.");
        err.status = 502;
        throw err;
      }
      const paymentUrl = String(data?.payment_url || "").trim();
      if (!paymentUrl) {
        const err = new Error("Khalti did not return a payment URL.");
        err.status = 502;
        throw err;
      }

      await saveInitiatedDonation({
        user: req.user,
        donorName,
        amount: amountNpr,
        purchaseOrderId,
        pidx,
      });

      logKhalti("initiate.success", {
        purchaseOrderId,
        pidx,
        paymentUrl,
        expiresAt: data?.expires_at || null,
      });

      return res.json({
        pidx,
        paymentUrl,
        returnUrl,
        purchaseOrderId,
        expiresAt: data?.expires_at || null,
      });
    } catch (e) {
      logKhalti("initiate.error", {
        message: e?.message || "Unknown error",
        status: e?.status || 500,
        payload: e?.payload || null,
      });
      return next(e);
    }
  },

  verify: async (req, res, next) => {
    try {
      const pidx = String(req.body?.pidx || "").trim();
      if (!pidx) {
        return res.status(400).json({ message: "pidx is required." });
      }

      logKhalti("verify.start", {
        userId: String(req.user?._id || ""),
        pidx,
      });

      const donation = await Donation.findOne({ pidx });
      if (!donation) {
        return res.status(404).json({ message: "Donation not found." });
      }

      const isOwner = String(donation.userId || "") === String(req.user?._id || "");
      if (!isOwner && req.user?.role !== "admin") {
        return res.status(403).json({ message: "You cannot verify this donation." });
      }

      const data = await khaltiFetch("/epayment/lookup/", { pidx });
      const status = String(data?.status || donation.status || "Initiated").trim() || "Initiated";
      const transactionId = String(data?.transaction_id || data?.txnId || "").trim();
      const totalAmount = paisaToNpr(data?.total_amount ?? data?.amount);
      const fee = paisaToNpr(data?.fee);

      donation.provider = "khalti";
      donation.status = status;
      donation.transactionId = transactionId;
      donation.totalAmount = totalAmount;
      donation.fee = fee;
      donation.refunded = Boolean(data?.refunded);

      await donation.save();

      logKhalti("verify.success", {
        pidx,
        status,
        transactionId,
        totalAmount,
        refunded: donation.refunded,
      });

      return res.json({
        success: status.toLowerCase() === "completed",
        status,
        donation: serializeDonation(donation),
      });
    } catch (e) {
      logKhalti("verify.error", {
        message: e?.message || "Unknown error",
        status: e?.status || 500,
        payload: e?.payload || null,
      });
      return next(e);
    }
  },

  callbackPage: async (req, res) => {
    logKhalti("callback.received", req.query || {});
    return res.status(200).send(callbackPageHtml(req.query || {}));
  },
};

export { donationController };
