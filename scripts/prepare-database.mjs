import { execSync } from "node:child_process";

const url = process.env.DATABASE_URL ?? "";
const hosted = url.startsWith("postgres") && !/localhost|127\.0\.0\.1/.test(url);

if (!hosted) {
  console.log("Skipping database migrations. Set DATABASE_URL to a hosted Postgres database before deploying.");
  process.exit(0);
}

execSync("prisma migrate deploy", { stdio: "inherit" });
