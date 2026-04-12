/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { resetRateLimitState, MAX_REQUESTS } from "@/lib/rate-limit";

function makeRequest(
  pathname: string,
  options?: { ip?: string; forwardedFor?: string; sessionCookie?: boolean }
): NextRequest {
  const headers = new Headers();
  if (options?.forwardedFor) {
    headers.set("x-forwarded-for", options.forwardedFor);
  }
  if (options?.ip) {
    headers.set("x-real-ip", options.ip);
  }

  const url = `http://localhost:3000${pathname}`;
  const request = new NextRequest(url, { headers });

  if (options?.sessionCookie) {
    request.cookies.set("authjs.session-token", "mock-session-token");
  }

  return request;
}

describe("middleware", () => {
  beforeEach(() => {
    resetRateLimitState();
  });

  it("redirects to sign-in when no session cookie on protected route", async () => {
    const response = await middleware(makeRequest("/"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/auth/signin");
  });

  it("allows access to sign-in page without session", async () => {
    const response = await middleware(makeRequest("/auth/signin"));

    expect(response.status).toBe(200);
  });

  it("allows access to auth API routes without session", async () => {
    const response = await middleware(makeRequest("/api/auth/callback/google"));

    expect(response.status).toBe(200);
  });

  it("sets rate limit headers on API requests with session", async () => {
    const response = await middleware(
      makeRequest("/api/grocery-items", {
        ip: "10.0.0.1",
        sessionCookie: true,
      })
    );

    expect(response.headers.get("X-RateLimit-Limit")).toBe(String(MAX_REQUESTS));
    expect(response.headers.get("X-RateLimit-Remaining")).toBe(
      String(MAX_REQUESTS - 1)
    );
  });

  it("returns 429 when rate limit is exceeded", async () => {
    for (let requestIndex = 0; requestIndex < MAX_REQUESTS; requestIndex++) {
      await middleware(
        makeRequest("/api/grocery-items", {
          ip: "10.0.0.1",
          sessionCookie: true,
        })
      );
    }

    const response = await middleware(
      makeRequest("/api/grocery-items", {
        ip: "10.0.0.1",
        sessionCookie: true,
      })
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
  });

  it("rate limits /api/lists routes", async () => {
    const response = await middleware(
      makeRequest("/api/lists", {
        ip: "10.0.0.2",
        sessionCookie: true,
      })
    );

    expect(response.headers.get("X-RateLimit-Limit")).toBe(String(MAX_REQUESTS));
  });
});
