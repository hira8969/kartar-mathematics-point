import http from "./http";

export const courseService = {
  getAll: () => http.get("/courses").then((response) => response.data),
  getById: (id) => http.get(`/courses/${id}`).then((response) => response.data),
  getFacultyAttendanceCourses: () => http.get("/courses/faculty/attendance").then((response) => response.data),
  getMyEnrollments: () => http.get("/courses/enrollments/me").then((response) => response.data),
  enroll: (id) => http.post(`/courses/${id}/enroll`).then((response) => response.data),
  create: (payload) => http.post("/courses", payload).then((response) => response.data),
  update: (id, payload) => http.put(`/courses/${id}`, payload).then((response) => response.data),
  remove: (id) => http.delete(`/courses/${id}`).then((response) => response.data),
  addMaterial: (id, payload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value);
      }
    });
    return http.post(`/courses/${id}/materials`, formData).then((response) => response.data);
  }
};
