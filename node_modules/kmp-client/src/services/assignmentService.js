import http from "./http";

export const assignmentService = {
  getAll: (course) => http.get("/assignments", { params: course ? { course } : {} }).then((response) => response.data),
  getSubmissions: (assignment) => http.get("/assignments/submissions", { params: assignment ? { assignment } : {} }).then((response) => response.data),
  create: (payload) => http.post("/assignments", payload).then((response) => response.data),
  update: (id, payload) => http.put(`/assignments/${id}`, payload).then((response) => response.data),
  submit: (id, payload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value);
      }
    });
    return http.post(`/assignments/${id}/submit`, formData).then((response) => response.data);
  },
  grade: (id, payload) => http.put(`/assignments/submissions/${id}/grade`, payload).then((response) => response.data)
};
