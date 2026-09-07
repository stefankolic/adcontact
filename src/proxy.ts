import { NextResponse, type NextRequest } from "next/server";

// Vercel auto-assigns this alias to every deployment on `main`; it serves the
// exact same site as www.adcontact.se and can't be turned off. Left alone, a
// crawler or shared link could treat it as a second, fully-indexable copy of
// the whole site. 301 it straight to the real domain, path and query intact.
//
// Scoped to this EXACT hostname only — do not widen to a *.vercel.app match,
// that would also catch branch preview deployments (adcontact-git-<branch>-
// adcgam.vercel.app) and break the preview-before-merge review workflow.
const VERCEL_PRODUCTION_ALIAS = "adcontact-pi.vercel.app";
const CANONICAL_HOST = "www.adcontact.se";

// Legacy Magento action endpoints (wishlist, product-compare, ...) never had
// a real page on this site and never will — the site has no cart/wishlist/
// compare system at all. Every hit is a unique, one-off URL (a fabricated
// form_key + product id), so it can NEVER be a cache hit no matter how well
// the content routes are tuned; left alone, each one falls all the way
// through to a full serverless function invocation just to return 404.
// Found 2026-09-07 investigating a Vercel Edge Requests/Function Invocations
// alert — a bot was replaying old Magento action URLs against the site.
// Reject the confirmed-dead prefixes here instead, before they reach a
// function. Extend this list if the same bot is later seen probing other
// Magento-only paths (checkout/, customer/account/, etc.).
const DEAD_MAGENTO_ACTION_PREFIXES = ["/wishlist/", "/catalog/product_compare/"];

export function proxy(request: NextRequest) {
  if (request.nextUrl.hostname === VERCEL_PRODUCTION_ALIAS) {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${CANONICAL_HOST}`);
    return NextResponse.redirect(url, 301);
  }

  if (DEAD_MAGENTO_ACTION_PREFIXES.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip static assets and the media/image proxies, which don't need SEO
    // canonicalisation and would just add latency to every asset request.
    "/((?!_next/static|_next/image|favicon.ico|media/).*)",
  ],
};
