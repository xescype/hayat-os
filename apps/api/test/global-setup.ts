// Vitest globalSetup: ayri process'te bir kez calisir (worker'lardan farkli).
// Burada set edilen process.env worker'lara YANSIMAZ; sadece bu process icindeki
// migrateTestDb() cagrisi icin gerekli.
import postgres from "postgres";
import { migrateTestDb } from "./db.js";

export default async function () {
  const url = process.env.TEST_DATABASE_URL ?? "postgres://hayatos:hayatos@db:5432/hayatos_test";
  process.env.DATABASE_URL = url;
  // maintenance baglantisi (postgres db) ile test DB olustur.
  const admin = postgres("postgres://hayatos:hayatos@db:5432/postgres", { max: 1 });
  try {
    const exists = await admin`SELECT 1 FROM pg_database WHERE datname = 'hayatos_test'`;
    if (exists.length === 0) await admin`CREATE DATABASE hayatos_test`;
  } finally {
    await admin.end();
  }
  await migrateTestDb();
}
