import axios from "axios";
import { clearSession, getAccessToken, isTokenExpired } from "./auth";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export function extractList(data) {
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token && isTokenExpired(token)) {
    clearSession();
    if (window.location.pathname !== "/") window.location.replace("/");
    return config;
  }

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const method = error?.config?.method?.toLowerCase();
    const isLoginRequest = error?.config?.url === "/" && method === "post";

    if (status === 401 && !isLoginRequest) {
      clearSession();
      if (window.location.pathname !== "/") window.location.replace("/");
    }

    return Promise.reject(error);
  }
);
