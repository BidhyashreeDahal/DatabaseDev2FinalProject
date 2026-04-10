const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://*.vercel.app",
];

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
    // Wildcard subdomain support, e.g. https://*.vercel.app
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

function resolveAllowedOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  const allowedOrigins = getAllowedOrigins();
  return isOriginAllowed(origin, allowedOrigins) ? origin : null;
}

function buildCorsHeaders(request, methods) {
  const origin = resolveAllowedOrigin(request);
  const headers = {
    "Access-Control-Allow-Methods": methods.join(", "),
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };

  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

export function withCors(request, response, methods = ["GET", "POST", "OPTIONS"]) {
  const headers = buildCorsHeaders(request, methods);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function preflight(request, methods = ["GET", "POST", "OPTIONS"]) {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(request, methods),
  });
}
