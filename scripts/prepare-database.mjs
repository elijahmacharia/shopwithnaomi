import { execSync } from "node:child_process";

const migrationUrl = process.env.DIRECT_URL ?? "";
const hosted = migrationUrl.startsWith("postgres") && !/localhost|127\.0\.0\.1/.test(migrationUrl);

if (!hosted) {
  console.log("Skipping database migrations. Set DIRECT_URL to the Supabase session connection on port 5432.");
  process.exit(0);
}

execSync("prisma migrate deploy", { stdio: "inherit" });
