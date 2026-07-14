// Ortam degiskeni dogrulama. Eksik/bozuk env => boot reddi (fail fast).
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DOMAIN: z.string().min(1).default("localhost"),
  TZ: z.string().default("Europe/Istanbul"),

  SETUP_TOKEN: z.string().min(16, "SETUP_TOKEN en az 16 karakter olmali"),
  DATABASE_URL: z.string().url(),

  // 32 bayt base64 => 44 karakter (padding'li). Sifreleme anahtari.
  SODIUM_MASTER_KEY: z.string().min(44, "SODIUM_MASTER_KEY 32 bayt base64 olmali"),
  BACKUP_AGE_KEY: z.string().optional(),

  VAPID_PUBLIC: z.string().min(1),
  VAPID_PRIVATE: z.string().min(1),
  VAPID_SUBJECT: z.string().default("mailto:admin@localhost"),

  // Vertex / GCP (Faz 0'da yalniz health icin kullanilir; opsiyonel).
  GCP_PROJECT_ID: z.string().optional(),
  GCP_LOCATION: z.string().default("us-central1"),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // Yedek (Faz 0'da gercek bucket'a test edilir).
  GCS_BACKUP_BUCKET: z.string().optional(),

  // Maliyet korkuluklari (Bolum 9.4).
  FLASH_DAILY_CAP: z.coerce.number().int().nonnegative().default(200),
  PRO_DAILY_CAP: z.coerce.number().int().nonnegative().default(5),
  AUDITOR_DAILY_CAP: z.coerce.number().int().nonnegative().default(2),
  TTS_DAILY_CAP: z.coerce.number().int().nonnegative().default(60),

  QUIET_HOURS: z.string().default("23:00-07:30"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    // Log Ingilizce (operator gorur), kullaniciya gitmez.
    console.error(`[env] Invalid environment variables:\n${issues}`);
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
