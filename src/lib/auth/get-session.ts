import { cookies } from "next/headers";
import { verifyAccessToken, type AccessTokenPayload } from "@/lib/auth/tokens";

/**
 * Reads and verifies the access token cookie for the current request.
 * Returns the session payload if valid, or null if there's no session at all.
 * This is the ONE place every protected Server Component/Action/Route Handler
 * should call to answer "who is making this request, if anyone."
 */
export async function getSession(): Promise<AccessTokenPayload | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  if (!accessToken) return null;
  return verifyAccessToken(accessToken);
}

export class SessionError extends Error {
  code: "NO_SESSION" | "INVALID_SESSION";

  constructor(code: "NO_SESSION" | "INVALID_SESSION", message: string) {
    super(message);
    this.name = "SessionError";
    this.code = code;
  }
}

/**
 * For Server Actions/controllers, not pages - throws a typed SessionError
 * instead of returning null, so the caller can catch it and return a clean
 * { success: false, error } result rather than crashing.
 *
 * Two distinct failure codes, not one generic "UNAUTHORIZED":
 * - NO_SESSION: no cookie was ever sent (never logged in, or already logged out)
 * - INVALID_SESSION: a cookie was sent, but it's expired or fails verification
 */
export async function requireSession(): Promise<AccessTokenPayload> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    throw new SessionError("NO_SESSION", "You must be logged in.");
  }

  const session = verifyAccessToken(accessToken);
  if (!session) {
    throw new SessionError("INVALID_SESSION", "Your session has expired. Please log in again.");
  }

  return session;
}