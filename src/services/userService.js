import { apiRequest } from "./api";

export const getCurrentUser = async () => {
  return apiRequest("/auth/me");
};

export const extractUser = (payload) => {
  return payload?.user || payload?.data || payload || null;
};

export default {
  getCurrentUser,
  extractUser,
};
