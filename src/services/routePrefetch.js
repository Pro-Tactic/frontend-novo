export function prefetchAdminLandingRoute() {
  return Promise.allSettled([
    import("../layouts/AppLayout"),
    import("../pages/Registro"),
  ]);
}

export function prefetchCoachLandingRoute() {
  return Promise.allSettled([
    import("../layouts/AppLayout"),
    import("../pages/Inicio"),
  ]);
}
