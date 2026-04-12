import { prisma } from "./prisma";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Executes a Prisma operation within a transaction that sets the
 * PostgreSQL session variable `app.current_user_id` for row-level security.
 *
 * The SET LOCAL ensures the variable is scoped to the transaction only
 * and does not leak to other connections in the pool.
 */
export async function withRLS<T>(
  userId: string,
  operation: (transaction: typeof prisma) => Promise<T>
): Promise<T> {
  if (!UUID_REGEX.test(userId)) {
    throw new Error("Invalid userId for RLS context");
  }

  return prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
    return operation(transaction as typeof prisma);
  });
}
