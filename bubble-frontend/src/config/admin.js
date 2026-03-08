export const ADMIN_EMAILS = ["adeetypaudel12@gmail.com", "ishanktm90@gmail.com"];

export function isAdminEmail(email) {
  const e = String(email || "").trim().toLowerCase();
  return ADMIN_EMAILS.includes(e);
}

