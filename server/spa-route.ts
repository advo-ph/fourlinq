const SPA_ROUTE = new Set([
  "/",
  "/products",
  "/products/windows",
  "/products/doors",
  "/products/specialist",
  "/whats-new",
  "/warranty",
  "/inspiration",
  "/for-architects",
  "/design-tool",
  "/why-upvc",
  "/aluminium",
  "/brand",
  "/faq",
  "/care",
  "/help-me-choose",
  "/finishes",
  "/glossary",
  "/legal",
  "/admin",
]);

/**
 * HTTP status for the production SPA shell.
 *
 * Known client routes receive 200 so React can hydrate them. A project slug is
 * dynamic and must hydrate before the CMS/fallback lookup can decide its fate.
 * Everything else receives the same NotFound shell with an honest 404 status.
 */
export function spaStatusForPath(pathname: string): 200 | 404 {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (SPA_ROUTE.has(normalized) || /^\/projects\/[^/]+$/.test(normalized)) {
    return 200;
  }
  return 404;
}
