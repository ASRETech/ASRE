import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

/**
 * Returns cookie options for the session cookie.
 *
 * Phase 2 — Session Persistence Fix:
 *  - `sameSite: "lax"` for same-origin navigations (was "none" which requires
 *    Secure and can be dropped by some browsers on HTTP dev environments).
 *  - `sameSite: "none"` is kept only for cross-origin HTTPS (e.g. Railway
 *    preview URLs served from a different subdomain than the API).
 *  - `secure` is derived from the actual request protocol / x-forwarded-proto
 *    so Railway's reverse proxy is respected correctly.
 *  - `domain` is intentionally left unset to avoid cross-subdomain cookie
 *    leakage and to let the browser default to the exact origin.
 */
export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const secure = isSecureRequest(req);
  const hostname = req.hostname ?? "";
  const isLocal =
    LOCAL_HOSTS.has(hostname) || isIpAddress(hostname);

  return {
    httpOnly: true,
    path: "/",
    // Use "lax" on localhost (HTTP) to avoid the browser silently dropping
    // the cookie. Use "none" only on secure cross-origin deployments.
    sameSite: secure && !isLocal ? "none" : "lax",
    secure,
  };
}
