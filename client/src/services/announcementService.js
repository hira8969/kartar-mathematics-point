import http from "./http";

export const announcementService = {
  getAll: (course) => http.get("/announcements", { params: course ? { course } : {} }).then((response) => response.data),
  create: (payload) => http.post("/announcements", payload).then((response) => response.data)
};
