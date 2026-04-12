import { NextResponse } from "next/server";
import { auth } from "./auth";

export interface AuthenticatedSession {
  userId: string;
  userEmail: string;
  userName: string | null;
}

/**
 * Extracts and validates the session from the current request.
 * Returns the session data or a 401 NextResponse.
 */
export async function requireSession(): Promise<
  { session: AuthenticatedSession; error: null } | { session: null; error: NextResponse }
> {
  const authSession = await auth();

  if (!authSession?.user?.id) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    session: {
      userId: authSession.user.id,
      userEmail: authSession.user.email ?? "",
      userName: authSession.user.name ?? null,
    },
    error: null,
  };
}
