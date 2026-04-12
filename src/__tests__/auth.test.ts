/**
 * @jest-environment node
 */
import { requireSession } from "@/lib/session";

// Mock the auth function from our auth module (which imports next-auth ESM)
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

import { auth } from "@/lib/auth";

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe("requireSession", () => {
  it("returns 401 when no session exists", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const result = await requireSession();

    expect(result.error).not.toBeNull();
    expect(result.error!.status).toBe(401);
    expect(result.session).toBeNull();
  });

  it("returns 401 when session has no user id", async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: "", email: "test@example.com" },
      expires: new Date().toISOString(),
    } as never);

    const result = await requireSession();

    expect(result.error).not.toBeNull();
    expect(result.error!.status).toBe(401);
  });

  it("returns session data when authenticated", async () => {
    mockAuth.mockResolvedValueOnce({
      user: {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
      },
      expires: new Date().toISOString(),
    } as never);

    const result = await requireSession();

    expect(result.error).toBeNull();
    expect(result.session).toEqual({
      userId: "user-123",
      userEmail: "test@example.com",
      userName: "Test User",
    });
  });

  it("handles missing name gracefully", async () => {
    mockAuth.mockResolvedValueOnce({
      user: {
        id: "user-123",
        email: "test@example.com",
        name: null,
      },
      expires: new Date().toISOString(),
    } as never);

    const result = await requireSession();

    expect(result.session?.userName).toBeNull();
  });
});
