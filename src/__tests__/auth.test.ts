/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { requireApiKey } from "@/lib/auth";

function makeRequest(apiKey?: string): NextRequest {
  const headers = new Headers();
  if (apiKey) {
    headers.set("x-api-key", apiKey);
  }
  return new NextRequest("http://localhost:3000/api/grocery-items", { headers });
}

describe("requireApiKey", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns 500 when API_KEY env var is not set", () => {
    delete process.env.API_KEY;
    const result = requireApiKey(makeRequest("any-key"));

    expect(result).not.toBeNull();
    expect(result!.status).toBe(500);
  });

  it("returns 401 when no x-api-key header is provided", () => {
    process.env.API_KEY = "secret-key-123";
    const result = requireApiKey(makeRequest());

    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it("returns 401 when the provided key is wrong", () => {
    process.env.API_KEY = "secret-key-123";
    const result = requireApiKey(makeRequest("wrong-key"));

    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it("returns 401 when the provided key has wrong length", () => {
    process.env.API_KEY = "secret-key-123";
    const result = requireApiKey(makeRequest("short"));

    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it("returns null when the correct key is provided", () => {
    process.env.API_KEY = "secret-key-123";
    const result = requireApiKey(makeRequest("secret-key-123"));

    expect(result).toBeNull();
  });
});
