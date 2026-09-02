const DEFAULT_API_URL = "http://localhost:5000/api";

export const getApiBaseUrl = () => {
  const rawUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
  const normalizedUrl = rawUrl.trim().replace(/\/+$/, "");

  return normalizedUrl.endsWith("/api") ? normalizedUrl : `${normalizedUrl}/api`;
};
