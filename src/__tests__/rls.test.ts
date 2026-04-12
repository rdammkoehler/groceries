/**
 * @jest-environment node
 */
import { withRLS } from "@/lib/rls";

// Mock the prisma client
jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn((callback: (tx: unknown) => Promise<unknown>) =>
      callback({
        $executeRaw: jest.fn(),
        groceryItem: { findMany: jest.fn().mockResolvedValue([]) },
      })
    ),
  },
}));

describe("withRLS", () => {
  it("rejects invalid user IDs", async () => {
    await expect(
      withRLS("not-a-uuid", async () => "result")
    ).rejects.toThrow("Invalid userId for RLS context");
  });

  it("rejects empty user IDs", async () => {
    await expect(withRLS("", async () => "result")).rejects.toThrow(
      "Invalid userId for RLS context"
    );
  });

  it("accepts valid UUIDs and executes the operation", async () => {
    const result = await withRLS(
      "550e8400-e29b-41d4-a716-446655440000",
      async (transaction) => {
        const items = await transaction.groceryItem.findMany({});
        return items;
      }
    );

    expect(result).toEqual([]);
  });

  it("accepts uppercase UUIDs", async () => {
    const result = await withRLS(
      "550E8400-E29B-41D4-A716-446655440000",
      async () => "ok"
    );

    expect(result).toBe("ok");
  });
});
