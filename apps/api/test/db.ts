// Entegrasyon test harness: migrate + truncate yardimcilari.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = join(here, "..", "migrations");

/** Global setup: test DB'yi migrate et (once yoksa olusturulmali — asagidaki not). */
export async function migrateTestDb(): Promise<void> {
  // onnotice: tekrar migrate'te "schema/relation already exists" NOTICE'lari sessize al
  // (idempotent rerun'da postgres.js varsayilani console.log ile gurultu yapiyor).
  const client = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
  try {
    await migrate(drizzle(client), { migrationsFolder });
  } finally {
    await client.end();
  }
}

export async function truncateLedger(): Promise<void> {
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  try {
    await client`TRUNCATE TABLE ledger_entries RESTART IDENTITY CASCADE`;
  } finally {
    await client.end();
  }
}
