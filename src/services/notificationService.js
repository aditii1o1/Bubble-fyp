import { apiRequest } from "./api";

export const getNotifications = async () => {
  return apiRequest("/notifications");
};

export const markNotificationRead = async ({ notificationId }) => {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: "POST",
  });
};

export const markAllNotificationsRead = async () => {
  return apiRequest("/notifications/read-all", {
    method: "POST",
  });
};

export default {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
