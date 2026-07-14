// Postgres baglantisi + Drizzle client. 1GB RAM icin kucuk havuz.
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env.js";
import * as schema from "./schema.js";

// max: 1GB RAM'de az baglanti yeter (tek kullanici). idle_timeout ile bosta kapanir.
export const sql = postgres(env.DATABASE_URL, {
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(sql, { schema });
export { schema };
