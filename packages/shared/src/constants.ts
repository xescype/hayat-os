// Sabitler — API ve PWA ortak kullanir. UI metni Turkce, kod Ingilizce (bkz docs/glossary.md).

/** Takvim blok kategorileri (Bolum 6 calendar_blocks.category). */
export const CATEGORIES = [
  "ders",
  "staj",
  "antrenman",
  "calisma",
  "yemek",
  "oyun",
  "kisisel",
  "burokrasi",
] as const;
export type Category = (typeof CATEGORIES)[number];

/** Kaya (dokunulmaz) / Kum (dokulur) modeli (Bolum 8.1). */
export const BLOCK_KINDS = ["rock", "sand"] as const;
export type BlockKind = (typeof BLOCK_KINDS)[number];

/** Kriz vitesleri (Bolum 8.14). */
export const MODES = ["normal", "hasta", "sinav", "yogun"] as const;
export type Mode = (typeof MODES)[number];

/** Mahremiyet etiketi (Bolum 9.3). sensitive => hicbir modele/OpenRouter paketine girmez. */
export const SENSITIVITY = ["normal", "sensitive"] as const;
export type Sensitivity = (typeof SENSITIVITY)[number];

/**
 * AI cagri amaclari. Her amac kendi gunluk tavanina (env) baglidir (Bolum 9.4).
 * withMetering(purpose) bu anahtari kullanir.
 */
export const AI_PURPOSES = ["parse", "deep", "auditor", "tts"] as const;
export type AiPurpose = (typeof AI_PURPOSES)[number];

/** Amac -> tavan env degiskeni adi eslemesi. */
export const AI_CAP_ENV: Record<AiPurpose, string> = {
  parse: "FLASH_DAILY_CAP",
  deep: "PRO_DAILY_CAP",
  auditor: "AUDITOR_DAILY_CAP",
  tts: "TTS_DAILY_CAP",
};

/** Defter kanallari/aktorleri (Bolum 6 ledger_entries) — Faz 1'de tablo gelince kullanilir. */
export const LEDGER_CHANNELS = ["voice", "text", "button", "system", "ai"] as const;
export type LedgerChannel = (typeof LEDGER_CHANNELS)[number];

export const LEDGER_ACTORS = ["user", "flash", "pro", "auditor", "system"] as const;
export type LedgerActor = (typeof LEDGER_ACTORS)[number];
