const USE_LOCAL_API = String(import.meta.env.VITE_USE_LOCAL_API || "false").toLowerCase() === "true";
const API_BASE_URL = (
  USE_LOCAL_API
    ? (import.meta.env.VITE_LOCAL_API_URL || "http://127.0.0.1:8000")
    : (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000")
).replace(/\/+$/, "");

export function resolveMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return "";

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  if (pathOrUrl.startsWith("//")) {
    return `http:${pathOrUrl}`;
  }

  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
