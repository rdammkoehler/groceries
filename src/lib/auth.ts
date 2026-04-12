import { NextRequest, NextResponse } from "next/server";

/**
 * API key authentication helper for Next.js API routes.
 *
 * Checks the X-Api-Key request header against the API_KEY environment variable.
 *
 * Returns null when the request is authorised.
 * Returns a NextResponse (401 or 500) when the request should be rejected.
 *
 * Usage:
 *   const authError = requireApiKey(request);
 *   if (authError) return authError;
 */
export function requireApiKey(request: NextRequest): NextResponse | null {
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    console.error("API_KEY environment variable is not set");
    return NextResponse.json(
      { error: "Server authentication is not configured" },
      { status: 500 }
    );
  }

  const providedKey = request.headers.get("x-api-key");
  if (!providedKey || providedKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
