const TOKEN_KEY          = "token";
const USER_TYPE_KEY      = "user_type";
const REFRESH_TOKEN_KEY  = "refresh_token";
const NAV_CACHE_KEY      = "pt_navigation_cache_v1";

function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded  = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function getAccessToken()         { return localStorage.getItem(TOKEN_KEY); }
export function isTokenExpired(token) {
  if (!token) return true;
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return payload.exp <= Math.floor(Date.now() / 1000);
}
export function isAuthenticated() {
  const token = getAccessToken();
  return !!token && !isTokenExpired(token);
}

export function saveSession({ access, refresh, user_type, first_name, last_name, clube_nome }) {
  if (access)      localStorage.setItem(TOKEN_KEY, access);
  if (refresh)     localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  if (user_type)   localStorage.setItem(USER_TYPE_KEY, user_type);
  if (first_name)  localStorage.setItem("first_name", first_name);
  if (last_name)   localStorage.setItem("last_name", last_name);
  if (clube_nome)  localStorage.setItem("clube_nome", clube_nome);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_TYPE_KEY);
  localStorage.removeItem("first_name");
  localStorage.removeItem("last_name");
  localStorage.removeItem("clube_nome");
  sessionStorage.removeItem(NAV_CACHE_KEY);
}

export function getUserType()   { return localStorage.getItem(USER_TYPE_KEY); }
export function getFirstName()  { return localStorage.getItem("first_name"); }
export function getLastName()   { return localStorage.getItem("last_name"); }
export function getClubeNome()  { return localStorage.getItem("clube_nome"); }

export function getUserId() {
  const token = getAccessToken();
  if (!token) return null;
  const payload = decodeToken(token);
  return payload?.user_id;
}
