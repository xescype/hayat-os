// Entegrasyon testleri: env.ts import edilmeden ONCE gecerli dummy degerleri koy.
// (setupFiles test dosyalarindan once calisir; worker process'inde calisir.)
import webpush from "web-push";

const vapid = webpush.generateVAPIDKeys();

process.env.NODE_ENV = "test";
process.env.DOMAIN = "localhost";
// Gercek reachable test DB (compose 'db' servisi). Ayri veritabani: hayatos_test.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgres://hayatos:hayatos@db:5432/hayatos_test";
process.env.SODIUM_MASTER_KEY = Buffer.alloc(32).toString("base64");
process.env.SETUP_TOKEN = "0123456789abcdef-test-token";
process.env.VAPID_PUBLIC = vapid.publicKey;
process.env.VAPID_PRIVATE = vapid.privateKey;
process.env.VAPID_SUBJECT = "mailto:test@localhost";
// Yedek testleri hermetik: konteyner .env'inden gelen GERCEK GCS ayarlarini sil ki
// hicbir test gercek bucket'a yukleme yapmasin; runBackup "yapilandirma eksik" dalini alsin.
delete process.env.GCS_BACKUP_BUCKET;
delete process.env.BACKUP_AGE_KEY;
