import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, MAX_REQUESTS } from "@/lib/rate-limit";

// Paths that do not require authentication
const PUBLIC_PATHS = ["/auth/signin", "/api/auth"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((publicPath) => pathname.startsWith(publicPath));
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Skip auth check for public paths
  if (!isPublicPath(pathname)) {
    // Check for Auth.js session cookie
    const sessionToken =
      request.cookies.get("__Secure-authjs.session-token") ??
      request.cookies.get("authjs.session-token");

    if (!sessionToken) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Apply rate limiting only to API routes (excluding auth)
  if (pathname.startsWith("/api/grocery-items") || pathname.startsWith("/api/lists")) {
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files, _next internals, and favicon
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
