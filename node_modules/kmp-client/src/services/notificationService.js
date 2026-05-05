import http from "./http";

export const notificationService = {
  getMine: () => http.get("/notifications").then((response) => response.data),
  markRead: (id) => http.patch(`/notifications/${id}/read`).then((response) => response.data),
  markAllRead: () => http.patch("/notifications/read-all").then((response) => response.data)
};
