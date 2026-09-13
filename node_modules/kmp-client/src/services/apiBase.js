const LOCAL_API_URL = "http://localhost:5000/api";
const DEPLOYED_API_URL = "https://kartar-mathematics-point-1.onrender.com/api";

export const getApiBaseUrl = () => {
  const isLocalApp = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const rawUrl = import.meta.env.VITE_API_URL || (isLocalApp ? LOCAL_API_URL : DEPLOYED_API_URL);
  const normalizedUrl = rawUrl.trim().replace(/\/+$/, "");

  return normalizedUrl.endsWith("/api") ? normalizedUrl : `${normalizedUrl}/api`;
};
