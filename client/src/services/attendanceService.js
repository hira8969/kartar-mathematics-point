import http from "./http";

export const attendanceService = {
  getMine: () => http.get("/attendance/me").then((response) => response.data),
  getCourseDateRecords: (courseId, date) => http.get(`/attendance/course/${courseId}`, { params: { date } }).then((response) => response.data),
  mark: (payload) => http.post("/attendance", payload).then((response) => response.data),
  update: (id, payload) => http.patch(`/attendance/${id}`, payload).then((response) => response.data),
  remove: (id) => http.delete(`/attendance/${id}`).then((response) => response.data)
};
