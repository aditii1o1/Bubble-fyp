import nodemailer from "nodemailer";

let cachedTransporter = null;
let cachedKey = "";

function getTransportConfig() {
  const emailUser = (process.env.EMAIL_USER || "").trim();
  const emailPassword = (process.env.EMAIL_PASSWORD || "").trim();
  if (emailUser && emailPassword) {
    return {
      key: `gmail:${emailUser}`,
      config: { service: "gmail", auth: { user: emailUser, pass: emailPassword } }
    };
  }

  const host = (process.env.SMTP_HOST || "").trim();
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const secure = (process.env.SMTP_SECURE || "false") === "true";
  const user = (process.env.SMTP_USER || "").trim();
  const pass = (process.env.SMTP_PASS || "").trim();

  if (!host || !user || !pass) return { key: "", config: null };
  return {
    key: `smtp:${host}:${port}:${secure}:${user}`,
    config: { host, port, secure, auth: { user, pass } }
  };
}

function getTransporter() {
  const { key, config } = getTransportConfig();
  if (!config) return null;

  if (cachedTransporter && cachedKey === key) return cachedTransporter;

  cachedKey = key;
  cachedTransporter = nodemailer.createTransport(config);
  return cachedTransporter;
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bubbleEmailHtml({ title, subtitle, buttonText, buttonUrl, footer, logoUrl, links = [] }) {
  const safeTitle = escapeHtml(title || "Bubble");
  const safeSubtitle = escapeHtml(subtitle || "");
  const safeButtonText = escapeHtml(buttonText || "Open Bubble");
  const safeButtonUrl = escapeHtml(buttonUrl || "#");
  const safeFooter = escapeHtml(footer || "If you didn’t request this, you can ignore it.");
  const showLogo = (process.env.EMAIL_SHOW_LOGO || "true").toLowerCase() !== "false";
  const envLogoUrl = (process.env.EMAIL_LOGO_URL || "").trim();
  const backendUrl = (process.env.BACKEND_PUBLIC_URL || "").trim();
  const chosenLogoUrl =
    (typeof logoUrl === "string" ? logoUrl.trim() : "") ||
    envLogoUrl ||
    (backendUrl ? `${backendUrl.replace(/\/$/, "")}/static/logo.png` : "");
  const safeLogoUrl = showLogo && chosenLogoUrl ? escapeHtml(chosenLogoUrl) : "";

  const safeLinks = Array.isArray(links) ? links : [];
  const linkItems = safeLinks
    .map((item) => {
      const url = typeof item?.url === "string" ? item.url.trim() : "";
      if (!url) return "";
      const label = typeof item?.label === "string" ? item.label.trim() : "";
      const safeUrl = escapeHtml(url);
      const safeLabel = escapeHtml(label || url);
      return `<li style="margin:0 0 6px 0;"><a href="${safeUrl}" style="color:#FF8FAB;text-decoration:underline;">${safeLabel}</a></li>`;
    })
    .filter(Boolean)
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap" rel="stylesheet">
    <style>
      body { margin:0; padding:0; }
      .font { font-family: 'Lora', Georgia, 'Times New Roman', serif; }
      a { color: #FF8FAB; }
      @media only screen and (max-width: 600px) {
        .email-container { width: 100% !important; }
        .email-content { padding: 20px !important; }
        .title { font-size: 20px !important; line-height: 26px !important; }
        .subtitle { font-size: 14px !important; line-height: 22px !important; }
        .cta-button { padding: 12px 16px !important; font-size: 14px !important; }
      }
    </style>
  </head>
  <body class="font" style="margin:0;padding:0;background:#FFF9F5;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${safeTitle} — ${safeSubtitle}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#FFF9F5;">
      <tr>
        <td align="center" style="padding:32px 16px;background:#FFE8ED;background:linear-gradient(135deg,#FFF9F5,#FFE8ED);">
          <table role="presentation" class="email-container" width="560" cellspacing="0" cellpadding="0" border="0" style="width:560px;max-width:560px;">
            <tr>
              <td style="padding:0;">
                <div style="text-align:center;margin-bottom:16px;">
                  <div style="display:inline-block;padding:10px 14px;border-radius:999px;background:#FFFFFF;border:1px solid #E0E0E0;">
                    ${
                      safeLogoUrl
                        ? `<img src="${safeLogoUrl}" alt="Bubble" style="height:20px;width:auto;vertical-align:middle;display:inline-block;margin-right:8px;" />`
                        : `<span style="font-weight:700;color:#333333;">Bubble</span>`
                    }
                    <span style="color:#888888;"> • Keep it kind</span>
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #E0E0E0;">
                  <tr>
                    <td style="padding:0;background:#FF8FAB;background:linear-gradient(90deg,#FF8FAB,#FFC2D1);height:10px;line-height:10px;font-size:0;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td class="email-content" style="padding:26px 22px;">
                      ${
                        safeLogoUrl
                          ? `<div style="text-align:center;margin:0 0 10px 0;">
                               <img src="${safeLogoUrl}" alt="Bubble" style="height:42px;width:auto;display:inline-block;" />
                             </div>`
                          : ``
                      }
                      <div class="title" style="font-size:22px;line-height:28px;font-weight:700;color:#333333;">
                        ${safeTitle}
                      </div>
                      <div class="subtitle" style="margin-top:10px;font-size:14px;line-height:22px;color:#333333;">
                        ${safeSubtitle}
                      </div>

                      <div style="margin-top:18px;">
                        <a href="${safeButtonUrl}" class="cta-button" style="display:inline-block;background:#FF8FAB;color:#FFFFFF;text-decoration:none;padding:12px 18px;border-radius:14px;font-weight:700;">
                          ${safeButtonText}
                        </a>
                      </div>

                      <div style="margin-top:14px;font-size:12px;line-height:18px;color:#888888;">
                        If the button doesn’t work, use this link:
                        <a href="${safeButtonUrl}" style="color:#FF8FAB;text-decoration:underline;">Open link</a>
                      </div>

                      ${
                        linkItems
                          ? `<div style="margin-top:12px;font-size:12px;line-height:18px;color:#888888;">
                              More links:
                              <ul style="margin:8px 0 0 18px;padding:0;">${linkItems}</ul>
                            </div>`
                          : ``
                      }

                      <div style="margin-top:18px;padding-top:14px;border-top:1px solid #F0F0F0;font-size:12px;line-height:18px;color:#888888;">
                        ${safeFooter}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 8px 0 8px;text-align:center;font-size:12px;line-height:18px;color:#888888;">
                You’re receiving this email because you used Bubble.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function bubbleEmailText({ title, subtitle, buttonUrl, footer }) {
  const safeTitle = String(title || "Bubble").trim();
  const safeSubtitle = String(subtitle || "").trim();
  const safeButtonUrl = String(buttonUrl || "").trim();
  const safeFooter = String(footer || "If you didn’t request this, you can ignore it.").trim();

  const linkBlock = safeButtonUrl.includes("\n")
    ? `Links:\n${safeButtonUrl}`
    : safeButtonUrl
      ? `Open link: ${safeButtonUrl}`
      : "";

  return [
    `Bubble — ${safeTitle}`,
    "",
    safeSubtitle,
    "",
    linkBlock,
    "",
    safeFooter
  ]
    .filter((line) => line !== "")
    .join("\n");
}

async function sendMail({ to, subject, html, text }) {
  const transporter = getTransporter();
  if (!transporter) {
    const hasGmail =
      (process.env.EMAIL_USER || "").trim() && (process.env.EMAIL_PASSWORD || "").trim();
    const hasSmtp =
      (process.env.SMTP_HOST || "").trim() &&
      (process.env.SMTP_USER || "").trim() &&
      (process.env.SMTP_PASS || "").trim();

    const hint = hasGmail || hasSmtp
      ? "Email not configured."
      : "Set EMAIL_USER + EMAIL_PASSWORD (Gmail App Password) or SMTP_HOST + SMTP_USER + SMTP_PASS.";

    console.warn(`${hint} Skipping email:`, subject);
    return false;
  }

  const resolvedHtml = typeof html === "string" && html.trim() ? html : undefined;
  const resolvedText = typeof text === "string" && text.trim() ? text : undefined;

  if (!resolvedHtml && !resolvedText) {
    throw new Error("sendMail requires `text` and/or `html`");
  }

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM ||
      process.env.EMAIL_FROM ||
      process.env.EMAIL_USER ||
      process.env.SMTP_USER ||
      "",
    to,
    subject,
    ...(resolvedText ? { text: resolvedText } : {}),
    ...(resolvedHtml ? { html: resolvedHtml } : {})
  });
  return true;
}

export { sendMail, bubbleEmailHtml, bubbleEmailText };
