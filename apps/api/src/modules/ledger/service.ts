import { ledgerWriteSchema, normalizeSearch, type LedgerWriteInput } from "@hayatos/shared";
import { db } from "../../db/client.js";
import { ledgerEntries } from "../../db/schema.js";

function buildRow(input: LedgerWriteInput) {
  const parsed = ledgerWriteSchema.parse(input);
  const searchNorm = normalizeSearch(`${parsed.raw_input ?? ""} ${parsed.response_text ?? ""}`.trim());
  return {
    channel: parsed.channel,
    actor: parsed.actor,
    rawInput: parsed.raw_input ?? null,
    interpretation: (parsed.interpretation ?? null) as unknown,
    moduleWrites: parsed.module_writes ?? null,
    responseText: parsed.response_text ?? null,
    audioRef: parsed.audio_ref ?? null,
    sensitivity: parsed.sensitivity,
    searchNorm: searchNorm.length ? searchNorm : null,
    ...(parsed.ts ? { ts: parsed.ts } : {}),
  };
}

/** Defter'e append-only yazim. Tek yazma kapisi (Bolum 5). */
export async function writeLedger(input: LedgerWriteInput): Promise<{ id: string }> {
  const [row] = await db.insert(ledgerEntries).values(buildRow(input)).returning({ id: ledgerEntries.id });
  return { id: row!.id };
}
