import http from "./http";

export const dashboardService = {
  student: () => http.get("/dashboard/student").then((response) => response.data),
  faculty: () => http.get("/dashboard/faculty").then((response) => response.data),
  admin: () => http.get("/dashboard/admin").then((response) => response.data)
};
