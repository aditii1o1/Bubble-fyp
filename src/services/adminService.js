import { apiRequest } from "./api";

export const getReports = async (params = {}) => {
  const search = new URLSearchParams(params).toString();
  const path = search ? `/admin/reports?${search}` : "/admin/reports";
  return apiRequest(path);
};

export const resolveReport = async ({ reportId, action }) => {
  return apiRequest(`/admin/reports/${reportId}/resolve`, {
    method: "POST",
    body: { action },
  });
};

export default {
  getReports,
  resolveReport,
};
