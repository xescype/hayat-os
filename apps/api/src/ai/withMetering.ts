// Maliyet korkulugu (Bolum 9.4): HER cagri buradan gecer. Tavan asiminda reddedilir.
// Store enjekte edilebilir => birim testte gercek DB gerekmez.
import { and, eq, gte, sql as dsql } from "drizzle-orm";
import type { AiPurpose } from "@hayatos/shared";
import { AI_CAP_ENV } from "@hayatos/shared";
import { db } from "../db/client.js";
import { aiCalls } from "../db/schema.js";
import { env } from "../env.js";
import type { AiOp } from "./provider.js";
import { estimateCost } from "./pricing.js";

export class CapExceededError extends Error {
  constructor(
    public readonly purpose: AiPurpose,
    public readonly cap: number,
  ) {
    // Kullaniciya giden mesaj Turkce (Bolum 0, Kural 1).
    super("Bugunluk yapay zeka butcesi doldu; bu is yarin sabaha kuyruklandi.");
    this.name = "CapExceededError";
  }
}

export interface AiCallRecord {
  provider: string;
  model: string;
  purpose: AiPurpose;
  inputTokens: number;
  outputTokens: number;
  estCost: number;
  durationMs: number;
  ok: boolean;
  error?: string;
}

/** Sayac deposu. Uretim = Postgres; test = bellek. */
export interface MeterStore {
  countToday(purpose: AiPurpose): Promise<number>;
  record(entry: AiCallRecord): Promise<void>;
}

const capFor = (purpose: AiPurpose): number =>
  (env as unknown as Record<string, number>)[AI_CAP_ENV[purpose]] ?? 0;

/** Postgres tabanli varsayilan store. Gun siniri sunucu now()'una gore (Faz 0). */
export const dbStore: MeterStore = {
  async countToday(purpose) {
    const rows = await db
      .select({ n: dsql<number>`count(*)::int` })
      .from(aiCalls)
      .where(and(eq(aiCalls.purpose, purpose), gte(aiCalls.ts, dsql`date_trunc('day', now())`)));
    return rows[0]?.n ?? 0;
  },
  async record(e) {
    await db.insert(aiCalls).values({
      provider: e.provider,
      model: e.model,
      purpose: e.purpose,
      inputTokens: e.inputTokens,
      outputTokens: e.outputTokens,
      estCost: e.estCost.toFixed(6),
      durationMs: e.durationMs,
      ok: e.ok,
      error: e.error,
    });
  },
};

/**
 * AiOp'u tavan kontrolu + kayit ile calistirir. Sonuca ulasmanin TEK yolu budur.
 * @throws CapExceededError tavan asilmissa (cagri yapilmaz).
 */
export async function runMetering<T>(op: AiOp<T>, store: MeterStore = dbStore): Promise<T> {
  const cap = capFor(op.purpose);
  const used = await store.countToday(op.purpose);
  if (used >= cap) throw new CapExceededError(op.purpose, cap);

  const started = Date.now();
  try {
    const { result, inputTokens = 0, outputTokens = 0, estCost } = await op.run();
    await store.record({
      provider: op.provider,
      model: op.model,
      purpose: op.purpose,
      inputTokens,
      outputTokens,
      estCost: estCost ?? estimateCost(op.model, inputTokens, outputTokens),
      durationMs: Date.now() - started,
      ok: true,
    });
    return result;
  } catch (err) {
    await store.record({
      provider: op.provider,
      model: op.model,
      purpose: op.purpose,
      inputTokens: 0,
      outputTokens: 0,
      estCost: 0,
      durationMs: Date.now() - started,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
