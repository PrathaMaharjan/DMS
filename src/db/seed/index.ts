import { slugify } from "@/lib/slugify";
import { db } from "..";
import { locations, organizations, userLocationRoles, users } from "../schema";
import { hashPassword } from "@/lib/auth/hash";


const SEED_PASSWORD = "Password123";
const ORG_NAME = "Sunrise Dental Group";

async function seed() {
  console.log("Seeding organization...");
  const [org] = await db
    .insert(organizations)
    .values({ name: ORG_NAME, slug: slugify(ORG_NAME) })
    .returning();

  console.log("Seeding location...");
  const [location] = await db
    .insert(locations)
    .values({ orgId: org.id, name: "Main Street Office" })
    .returning();

  const staffToSeed = [
    { role: "owner" as const, name: "Olivia Owner", email: "owner@gmail.com" },
    { role: "clinical" as const, name: "Dr. Priya Chen", email: "doctor@gmail.com" },
    { role: "front_office" as const, name: "Frankie Frontdesk", email: "frontoffice@gmail.com" },
  ];

  console.log("Seeding one user per role...");
  const passwordHash = await hashPassword(SEED_PASSWORD);

  for (const staff of staffToSeed) {
    const [user] = await db
      .insert(users)
      .values({ orgId: org.id, email: staff.email, passwordHash, name: staff.name })
      .returning();

    await db.insert(userLocationRoles).values({
      userId: user.id,
      locationId: location.id,
      role: staff.role,
    });

    console.log(`  ${staff.role.padEnd(12)} -> ${staff.email} / ${SEED_PASSWORD}`);
  }

  console.log("Done seeding.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});