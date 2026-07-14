// Test ortami: env.ts import edilmeden ONCE gecerli dummy degerleri koy.
// (setupFiles test dosyalarindan once calisir.)
import webpush from "web-push";

const vapid = webpush.generateVAPIDKeys();

process.env.NODE_ENV = "test";
process.env.DOMAIN = "localhost";
process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test";
// 32 sifir bayt base64 (44 karakter).
process.env.SODIUM_MASTER_KEY = Buffer.alloc(32).toString("base64");
process.env.SETUP_TOKEN = "0123456789abcdef-test-token";
process.env.VAPID_PUBLIC = vapid.publicKey;
process.env.VAPID_PRIVATE = vapid.privateKey;
process.env.VAPID_SUBJECT = "mailto:test@localhost";
