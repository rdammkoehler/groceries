import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, MAX_REQUESTS } from "@/lib/rate-limit";

export function middleware(request: NextRequest): NextResponse {
  // Extract client IP. When behind a trusted reverse proxy (Vercel, Traefik),
  // the proxy appends the real client IP as the rightmost entry in
  // X-Forwarded-For. We take the rightmost value to avoid trusting
  // client-supplied entries on the left side of the chain.
  // IMPORTANT: The reverse proxy MUST be configured to append (not pass through)
  // the client IP. See DEPLOY.md for proxy configuration requirements.
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",").pop()!.trim()
    : (request.headers.get("x-real-ip") ?? "unknown");

  const { limited, remaining } = checkRateLimit(ip);

  if (limited) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": String(MAX_REQUESTS),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(MAX_REQUESTS));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  return response;
}

// Apply only to the grocery-items API routes.
// The health endpoint is intentionally excluded so readiness probes are never throttled.
export const config = {
  matcher: ["/api/grocery-items", "/api/grocery-items/:path*"],
};
