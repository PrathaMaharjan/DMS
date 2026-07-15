import { Pool } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set. Did you run with --env-file=.env ?");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  const result = await pool.query("SELECT NOW() AS current_time");
  console.log("✅ Connected! Database says the time is:", result.rows[0].current_time);
} catch (error) {
  console.error("❌ Connection failed:", error.message);
  process.exit(1);
} finally {
  await pool.end();
}