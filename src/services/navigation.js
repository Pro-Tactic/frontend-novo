import { api } from "./api";

const NAV_CACHE_KEY = "pt_navigation_cache_v1";

let inMemoryNav = null;
let inFlightNavPromise = null;

export function cacheNavigation(data) {
  inMemoryNav = data;
  try {
    sessionStorage.setItem(NAV_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore browser storage errors.
  }
}

export function getCachedNavigation() {
  if (inMemoryNav) return inMemoryNav;

  try {
    const raw = sessionStorage.getItem(NAV_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    inMemoryNav = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export function clearCachedNavigation() {
  inMemoryNav = null;
  inFlightNavPromise = null;
  try {
    sessionStorage.removeItem(NAV_CACHE_KEY);
  } catch {
    // Ignore browser storage errors.
  }
}

export async function fetchNavigation({ preferCache = true } = {}) {
  if (preferCache) {
    const cached = getCachedNavigation();
    if (cached) return cached;
  }

  if (inFlightNavPromise) {
    return inFlightNavPromise;
  }

  inFlightNavPromise = api
    .get("/navigation/")
    .then((res) => {
      cacheNavigation(res.data);
      return res.data;
    })
    .finally(() => {
      inFlightNavPromise = null;
    });

  return inFlightNavPromise;
}