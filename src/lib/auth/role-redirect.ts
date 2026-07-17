import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userLocationRoles } from "@/db/schema";

export const ROLE_REDIRECT_PATHS = {
  owner: "admin",
  clinical: "doctor",
  front_office: "frontdesk",
} as const;

const ROLE_PRIORITY = ["owner", "clinical", "front_office"] as const;

export async function getPrimaryRoleForUser(
  userId: string,
): Promise<keyof typeof ROLE_REDIRECT_PATHS | null> {
  const roleRows = await db.query.userLocationRoles.findMany({
    where: eq(userLocationRoles.userId, userId),
  });

  if (roleRows.length === 0) return null;

  const heldRoles = new Set(roleRows.map((r) => r.role));
  for (const role of ROLE_PRIORITY) {
    if (heldRoles.has(role)) return role;
  }
  return null;
}

export async function getRedirectPathForUser(userId: string, orgSlug: string): Promise<string | null> {
  const role = await getPrimaryRoleForUser(userId);
  return role ? `/t/${orgSlug}/${ROLE_REDIRECT_PATHS[role]}` : null;
}