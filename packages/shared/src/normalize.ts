// Turkce karakter -> ASCII. Map ONCE, sonra lowercase (JS 'İ'.toLowerCase() combining-dot uretir).
const FOLD: Record<string, string> = {
  ç: "c", Ç: "c", ş: "s", Ş: "s", ğ: "g", Ğ: "g",
  ü: "u", Ü: "u", ö: "o", Ö: "o", ı: "i", İ: "i",
  â: "a", Â: "a", î: "i", Î: "i", û: "u", Û: "u",
};

/** Arama normalizasyonu: Turkce->ASCII katla, lowercase. Yazim+sorgu ayni fonksiyon. */
export function normalizeSearch(input: string): string {
  let out = "";
  for (const ch of input) out += FOLD[ch] ?? ch;
  return out.toLowerCase();
}
