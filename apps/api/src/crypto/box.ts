// At-rest simetrik sifreleme (Bolum 4/10). AES-256-GCM (Node yerlesik crypto).
// Karar: spec "sealed-box" (asimetrik) diyordu; env'deki tek simetrik anahtar icin yanlisti.
// libsodium secretbox planlanmisti ama paketin ESM alt-import'u bozuk => Node crypto AES-256-GCM:
// ayni derecede dogru authenticated symmetric cipher, sifir bagimlilik. (bkz docs/kararlar.md)
import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import { env } from "../env.js";

const IV_BYTES = 12;
const TAG_BYTES = 16;

let key: Buffer | null = null;
function getKey(): Buffer {
  if (key) return key;
  const k = Buffer.from(env.SODIUM_MASTER_KEY, "base64");
  if (k.length !== 32) {
    throw new Error(`SODIUM_MASTER_KEY must be 32 bytes (base64). Got ${k.length}.`);
  }
  key = k;
  return key;
}

/**
 * Sifrele: cikti = [iv(12) | tag(16) | ciphertext].
 * GCM kurali: (key, iv) cifti ASLA tekrar kullanilmaz. Her cagride yeni rastgele 96-bit IV
 * uretilir (cakisma olasiligi ~2^32 mesaja kadar ihmal edilebilir; tek kullanici => guvenli).
 * IV gizli degildir, ciktinin basina acikca eklenir.
 */
export async function seal(plain: Uint8Array): Promise<Uint8Array> {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]);
}

/** Coz: [iv(12) | tag(16) | ciphertext] bekler. Bozuk/yanlis anahtarda firlatir. */
export async function open(sealed: Uint8Array): Promise<Uint8Array> {
  const buf = Buffer.from(sealed);
  const iv = buf.subarray(0, IV_BYTES);
  const tag = buf.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const enc = buf.subarray(IV_BYTES + TAG_BYTES);
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]);
}
