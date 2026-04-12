/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { resetRateLimitState, MAX_REQUESTS } from "@/lib/rate-limit";

function makeRequest(ip?: string, forwardedFor?: string): NextRequest {
  const headers = new Headers();
  if (forwardedFor) {
    headers.set("x-forwarded-for", forwardedFor);
  }
  if (ip) {
    headers.set("x-real-ip", ip);
  }
  return new NextRequest("http://localhost:3000/api/grocery-items", { headers });
}

describe("middleware", () => {
  beforeEach(() => {
    resetRateLimitState();
  });

  it("sets rate limit headers on successful requests", () => {
    const response = middleware(makeRequest("10.0.0.1"));

    expect(response.headers.get("X-RateLimit-Limit")).toBe(String(MAX_REQUESTS));
    expect(response.headers.get("X-RateLimit-Remaining")).toBe(String(MAX_REQUESTS - 1));
  });

  it("returns 429 when rate limit is exceeded", () => {
    for (let requestIndex = 0; requestIndex < MAX_REQUESTS; requestIndex++) {
      middleware(makeRequest("10.0.0.1"));
    }

    const response = middleware(makeRequest("10.0.0.1"));

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
  });

  it("extracts IP from the rightmost X-Forwarded-For entry", () => {
    // Simulate: client spoofs "fake-ip", proxy appends real "10.0.0.1"
    const response = middleware(makeRequest(undefined, "fake-ip, 10.0.0.1"));

    expect(response.headers.get("X-RateLimit-Remaining")).toBe(String(MAX_REQUESTS - 1));

    // Exhaust rate limit for "10.0.0.1" (the rightmost/real IP)
    for (let requestIndex = 1; requestIndex < MAX_REQUESTS; requestIndex++) {
      middleware(makeRequest(undefined, "different-fake, 10.0.0.1"));
    }

    const blockedResponse = middleware(makeRequest(undefined, "yet-another-fake, 10.0.0.1"));
    expect(blockedResponse.status).toBe(429);
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const response = middleware(makeRequest("172.16.0.1"));

    expect(response.headers.get("X-RateLimit-Remaining")).toBe(String(MAX_REQUESTS - 1));
  });

  it("uses 'unknown' when no IP headers are present", () => {
    const response = middleware(makeRequest());

    expect(response.headers.get("X-RateLimit-Remaining")).toBe(String(MAX_REQUESTS - 1));
  });
});
