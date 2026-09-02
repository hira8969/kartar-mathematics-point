import axios from "axios";
import { storage } from "../utils/storage";
import { getApiBaseUrl } from "./apiBase";

const http = axios.create({
  baseURL: getApiBaseUrl()
});

http.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;
