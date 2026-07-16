import { db } from "@/db";
import { organizations, refreshTokens, users } from "@/db/schema";
import { verifyPassword } from "@/lib/auth/hash";
import { generateRefreshToken, hashRefreshToken, signAccessToken } from "@/lib/auth/tokens";
import { loginSchema } from "@/lib/validators/auth";
import { eq, or } from "drizzle-orm";

export type LoginResult =
  | {
      success: true;
      accessToken: string;
      refreshToken: string;
      refreshTokenExpiresAt: Date;
      user: { id: string; orgId: string; name: string; email: string };
      org: { slug: string; name: string };
    }
  | { success: false; error: string };

export async function loginController(input: unknown): Promise<LoginResult> {
//  console.log(input)
    const parsed = loginSchema.safeParse(input);
//   console.log(parsed)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Invalid input.";
    return { success: false, error: firstIssue };
  }
  const { identifier, password } = parsed.data;
  const user = await db.query.users.findFirst({
    where: or(eq(users.email, identifier), eq(users.phone, identifier)),
  });

  if (!user) {
    return { success: false, error: "Invalid email or password." };
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) {
    return { success: false, error: "Invalid email or password." };
  }
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, user.orgId),
  });
  if (!org) {
    return { success: false, error: "Invalid email or password." };
  }
  if (org.status === "suspended" || org.status === "cancelled") {
    return {
      success: false,
      error: "This clinic's account is not active. Contact support.",
    };
  }

  const accessToken = signAccessToken({ userId: user.id, orgId: user.orgId });
  const { token: refreshToken, tokenHash, expiresAt } = generateRefreshToken();

  await db
    .insert(refreshTokens)
    .values({ userId: user.id, tokenHash, expiresAt });

  return {
    success: true,
    accessToken,
    refreshToken,
    refreshTokenExpiresAt: expiresAt,
    user: {
      id: user.id,
      orgId: user.orgId,
      name: user.name,
      email: user.email,
    },
    org: { slug: org.slug, name: org.name },
  };
}

export async function logoutController(rawRefreshToken: string | undefined): Promise<void> {
  if (!rawRefreshToken) return;
  const tokenHash = hashRefreshToken(rawRefreshToken);
  await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.tokenHash, tokenHash));
}