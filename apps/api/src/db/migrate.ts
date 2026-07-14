// Boot'ta migration'lari otomatik uygular (Bolum 4).
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { env } from "../env.js";

const here = dirname(fileURLToPath(import.meta.url));
// dist/db/migrate.js -> ../../migrations ; src/db/migrate.ts -> ../../migrations
const migrationsFolder = join(here, "..", "..", "migrations");

export async function runMigrations(): Promise<void> {
  const client = postgres(env.DATABASE_URL, { max: 1 });
  try {
    await migrate(drizzle(client), { migrationsFolder });
  } finally {
    await client.end();
  }
}
