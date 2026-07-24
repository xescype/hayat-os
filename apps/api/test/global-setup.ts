// Vitest globalSetup: ayri process'te bir kez calisir (worker'lardan farkli).
// Burada set edilen process.env worker'lara YANSIMAZ; sadece bu process icindeki
// migrateTestDb() cagrisi icin gerekli.
import postgres from "postgres";
import { migrateTestDb } from "./db.js";

/** Cozumlenmis test URL'inden maintenance baglantisi turetir: host/port/kimlik AYNI kalir,
 *  sadece yol 'postgres' bakim veritabanina cevrilir. TEST_DATABASE_URL override edilirse
 *  (orn. CI'da localhost) maintenance baglantisi da onu takip eder — ayri, sabit bir
 *  baglanti dizesi kullanilmaz (aksi halde CI'da 'db' host'u cozulemez, olusturma patlar). */
export function adminUrlFor(resolvedUrl: string): string {
  const u = new URL(resolvedUrl);
  u.pathname = "/postgres";
  return u.toString();
}

export default async function () {
  const url = process.env.TEST_DATABASE_URL ?? "postgres://hayatos:hayatos@db:5432/hayatos_test";
  process.env.DATABASE_URL = url;
  // maintenance baglantisi: ayni host/port/kimlik, sadece db adi 'postgres'.
  const admin = postgres(adminUrlFor(url), { max: 1 });
  try {
    const exists = await admin`SELECT 1 FROM pg_database WHERE datname = 'hayatos_test'`;
    if (exists.length === 0) await admin`CREATE DATABASE hayatos_test`;
  } finally {
    await admin.end();
  }
  await migrateTestDb();
}
