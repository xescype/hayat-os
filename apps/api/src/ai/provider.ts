// Saglayici soyutlamasi (Bolum 9.1).
// TASARIM: Provider metotlari Promise DEGIL, bir AiOp<T> (tarif) doner. Sonuca ulasmanin TEK yolu
// runMetering(op) icinden gecmektir (withMetering.ts). Boylece "sayacsiz cagri" tip duzeyinde imkansiz:
// AiOp beklenebilir (awaitable) degildir; calistirmak icin metering'e vermek ZORUNLU.
import type { AiPurpose } from "@hayatos/shared";

export interface AiUsage {
  inputTokens?: number;
  outputTokens?: number;
  /** Saglayici kendi maliyetini biliyorsa; yoksa pricing.ts hesaplar. */
  estCost?: number;
}

export interface AiOp<T> {
  readonly purpose: AiPurpose;
  readonly provider: string;
  readonly model: string;
  /** SADECE runMetering tarafindan cagirilir. */
  readonly run: () => Promise<{ result: T } & AiUsage>;
}

export interface HealthResult {
  ok: boolean;
  detail: string;
}

export interface AiProvider {
  readonly name: string;
  health(): AiOp<HealthResult>;
  // Faz 1: complete(req): AiOp<Completion>;
  // Faz 1: transcribeAndParse(audio, req): AiOp<ParseResult>;
}

/** Provider yazarken AiOp uretmek icin kucuk yardimci. */
export function defineOp<T>(
  meta: { purpose: AiPurpose; provider: string; model: string },
  run: AiOp<T>["run"],
): AiOp<T> {
  return { ...meta, run };
}
