import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const RATE_LIMIT = 60;

export function middleware(request: NextRequest): NextResponse {
  // Extract client IP, preferring the leftmost address from X-Forwarded-For
  // (set by Traefik or other reverse proxies in front of the app).
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : (request.headers.get("x-real-ip") ?? "unknown");

  const { limited, remaining } = checkRateLimit(ip);

  if (limited) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": String(RATE_LIMIT),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  return response;
}

// Apply only to the grocery-items API routes.
// The health endpoint is intentionally excluded so readiness probes are never throttled.
export const config = {
  matcher: ["/api/grocery-items", "/api/grocery-items/:path*"],
};
