import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "auth_token";
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://*.vercel.app",
];
const PUBLIC_API_PATHS = new Set(["/api/auth/login", "/api/auth/logout"]);

function getAllowedOrigins() {
  const fromEnv = process.env.CORS_ALLOWED_ORIGINS;
  if (!fromEnv) return DEFAULT_ALLOWED_ORIGINS;

  return fromEnv
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin, allowedOrigins) {
  let originUrl;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }

  return allowedOrigins.some((allowed) => {
    if (allowed === origin) return true;
    const wildcardMatch = allowed.match(/^(https?):\/\/\*\.(.+)$/);
    if (wildcardMatch) {
      const [, protocol, domain] = wildcardMatch;
      return (
        originUrl.protocol === `${protocol}:` &&
        (originUrl.hostname === domain || originUrl.hostname.endsWith(`.${domain}`))
      );
    }
    return false;
  });
}

function applyCorsHeaders(request, response) {
  const origin = request.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Vary", "Origin");

  if (origin && isOriginAllowed(origin, allowedOrigins)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  return response;
}

function unauthorized(request) {
  const response = NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  return applyCorsHeaders(request, response);
}

export function proxy(request) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Let route handlers answer CORS preflight.
  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  if (PUBLIC_API_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return unauthorized(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
