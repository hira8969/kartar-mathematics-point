import http from "./http";

export const examService = {
  getAll: (course) => http.get("/exams", { params: course ? { course } : {} }).then((response) => response.data),
  getResults: () => http.get("/exams/results").then((response) => response.data),
  create: (payload) => http.post("/exams", payload).then((response) => response.data),
  update: (id, payload) => http.put(`/exams/${id}`, payload).then((response) => response.data),
  remove: (id) => http.delete(`/exams/${id}`).then((response) => response.data),
  submit: (id, payload) => http.post(`/exams/${id}/submit`, payload).then((response) => response.data)
};
