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