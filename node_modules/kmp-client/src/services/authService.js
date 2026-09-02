import http from "./http";

export const authService = {
  login: (payload) => http.post("/auth/login", payload).then((response) => response.data),
  me: () => http.get("/auth/me").then((response) => response.data)
};
