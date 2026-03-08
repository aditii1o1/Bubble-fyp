import { api } from "./apiClient";

function normalizeReport(id, data) {
  const createdAt =
    data?.createdAt?.toDate?.()?.toISOString?.() || data?.createdAt || null;
  const resolvedAt =
    data?.resolvedAt?.toDate?.()?.toISOString?.() || data?.resolvedAt || null;

  return {
    id,
    status: data.status || "open",
    targetType: data.targetType || "post",
    targetId: data.targetId || "",
    targetPostId: data.targetPostId || null, // for comment reports
    targetText: data.targetText || "",
    reason: data.reason || "",
    description: data.description || "",
    reporterId: data.reporterId || "",
    reporterEmail: data.reporterEmail || "",
    reporterNickname: data.reporterNickname || "",
    reportedUserId: data.reportedUserId || "",
    reportedUserNickname: data.reportedUserNickname || "",
    createdAt: createdAt || new Date().toISOString(),
    resolvedAt,
    actionTaken: data.actionTaken || null,
  };
}

export const adminService = {
  createReport: async ({
    reporterUid,
    reporterEmail,
    reporterNickname,
    targetType,
    targetId,
    targetPostId,
    targetText,
    reportedUserId,
    reportedUserNickname,
    reason,
    description,
  }) => {
    const res = await api.post("/admin/reports", {
      reporterUid,
      reporterEmail,
      reporterNickname,
      targetType,
      targetId,
      targetPostId,
      targetText,
      reportedUserId,
      reportedUserNickname,
      reason,
      description,
    });
    const r = res.data?.report;
    return r ? normalizeReport(r.id, r) : null;
  },

  getReports: async ({ status = "open", pageSize = 50 } = {}) => {
    const res = await api.get("/admin/reports", { params: { status, pageSize } });
    const items = Array.isArray(res.data?.reports) ? res.data.reports : [];
    return items.map((r) => normalizeReport(r.id, r));
  },

  getReportById: async (reportId) => {
    const res = await api.get(`/admin/reports/${String(reportId || "")}`);
    const r = res.data?.report;
    return r ? normalizeReport(r.id, r) : null;
  },

  resolveReport: async ({ reportId, actionTaken = "resolved" }) => {
    await api.patch(`/admin/reports/${String(reportId || "")}/resolve`, { actionTaken });
    return true;
  },

  markReportDeleted: async ({ reportId, actionTaken = "deleted" }) => {
    await api.patch(`/admin/reports/${String(reportId || "")}/deleted`, { actionTaken });
    return true;
  },

  banUser: async ({ userId }) => {
    await api.patch(`/admin/users/${String(userId || "")}/ban`);
    return true;
  },

  unbanUser: async ({ userId }) => {
    await api.patch(`/admin/users/${String(userId || "")}/unban`);
    return true;
  },

  getUsers: async ({ pageSize = 100 } = {}) => {
    const res = await api.get("/admin/users", { params: { pageSize } });
    return Array.isArray(res.data?.users) ? res.data.users : [];
  },

  getDashboardCounts: async () => {
    const res = await api.get("/admin/dashboard");
    return res.data;
  },
};
