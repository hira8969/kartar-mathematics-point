import http from "./http";

export const adminService = {
  overview: () => http.get("/admin/overview").then((response) => response.data),
  users: () => http.get("/admin/users").then((response) => response.data),
  createUser: (payload) => http.post("/admin/users", payload).then((response) => response.data),
  bulkApproveUsers: (userIds) => http.patch("/admin/users/bulk-approve", { userIds }).then((response) => response.data),
  bulkDeleteUsers: (userIds) => http.post("/admin/users/bulk-delete", { userIds }).then((response) => response.data),
  updateUser: (id, payload) => http.patch(`/admin/users/${id}`, payload).then((response) => response.data),
  deleteUser: (id) => http.delete(`/admin/users/${id}`).then((response) => response.data),
  reports: () => http.get("/admin/reports").then((response) => response.data),
  getInstituteSettings: () => http.get("/admin/settings/institute").then((response) => response.data),
  updateInstituteSettings: (payload) => http.put("/admin/settings/institute", payload).then((response) => response.data)
};
