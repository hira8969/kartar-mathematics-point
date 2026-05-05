import http from "./http";

export const timetableService = {
  getBranding: () => http.get("/timetables/branding").then((response) => response.data),
  getMine: () => http.get("/timetables/mine").then((response) => response.data),
  getAll: () => http.get("/timetables").then((response) => response.data),
  create: (payload) => http.post("/timetables", payload).then((response) => response.data),
  update: (id, payload) => http.patch(`/timetables/${id}`, payload).then((response) => response.data),
  reorder: (items) => http.patch("/timetables/reorder", { items }).then((response) => response.data),
  remove: (id) => http.delete(`/timetables/${id}`).then((response) => response.data)
};
