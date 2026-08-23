import { and, desc, eq, gte, ilike, isNull, lte, sql as dsql } from "drizzle-orm";
import { ledgerWriteSchema, normalizeSearch, type LedgerWriteInput } from "@hayatos/shared";
import { db } from "../../db/client.js";
import { ledgerEntries } from "../../db/schema.js";
import { decodeCursor, encodeCursor } from "./cursor.js";

export type LedgerRow = typeof ledgerEntries.$inferSelect;

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

/** Atomik supersede: yeni satir + eskiyi isaretle (WHERE superseded_by IS NULL). rowcount=0 => rollback. */
export async function supersede(oldId: string, newInput: LedgerWriteInput): Promise<{ id: string }> {
  return db.transaction(async (tx) => {
    const [created] = await tx.insert(ledgerEntries).values(buildRow(newInput)).returning({ id: ledgerEntries.id });
    const marked = await tx
      .update(ledgerEntries)
      .set({ supersededBy: created!.id })
      .where(and(eq(ledgerEntries.id, oldId), isNull(ledgerEntries.supersededBy)))
      .returning({ id: ledgerEntries.id });
    if (marked.length === 0) throw new Error("Kayit bulunamadi veya zaten duzeltilmis.");
    return { id: created!.id };
  });
}

/** Supersede zincirini (en eski -> en yeni) dondurur. */
export async function getChain(startId: string): Promise<LedgerRow[]> {
  const out: LedgerRow[] = [];
  let cur: string | null = startId;
  const seen = new Set<string>();
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    const [row] = await db.select().from(ledgerEntries).where(eq(ledgerEntries.id, cur));
    if (!row) break;
    out.push(row);
    cur = row.supersededBy;
  }
  return out;
}

export interface ListOpts {
  cursor?: string;
  limit?: number;
}

export interface SearchOpts extends ListOpts {
  q?: string;
  from?: Date;
  to?: Date;
  channel?: string;
}

export interface Page {
  rows: LedgerRow[];
  nextCursor: string | null;
}

const clampLimit = (n?: number) => Math.min(Math.max(n ?? 50, 1), 200);

/** Aktif gorunum (superseded haric), ts desc sayfali. */
export async function listActive(opts: ListOpts = {}): Promise<Page> {
  return search({ ...opts });
}

/** Aktif gorunumde filtreli arama: q search_norm uzerinden ilike (pg_trgm GIN),
 *  from/to ts araligi, channel esitligi; cursor (ts,id) satir karsilastirmasiyla sayfalar. */
export async function search(opts: SearchOpts = {}): Promise<Page> {
  const limit = clampLimit(opts.limit);
  const conds = [isNull(ledgerEntries.supersededBy)];
  const qNorm = opts.q ? normalizeSearch(opts.q) : "";
  if (qNorm) conds.push(ilike(ledgerEntries.searchNorm, `%${qNorm}%`));
  if (opts.from) conds.push(gte(ledgerEntries.ts, opts.from));
  if (opts.to) conds.push(lte(ledgerEntries.ts, opts.to));
  if (opts.channel) conds.push(eq(ledgerEntries.channel, opts.channel));
  const cur = opts.cursor ? decodeCursor(opts.cursor) : null;
  if (cur) conds.push(dsql`(${ledgerEntries.ts}, ${ledgerEntries.id}) < (${cur.ts}, ${cur.id})`);

  const rows = await db
    .select()
    .from(ledgerEntries)
    .where(and(...conds))
    .orderBy(desc(ledgerEntries.ts), desc(ledgerEntries.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const last = page[page.length - 1];
  return { rows: page, nextCursor: hasMore && last ? encodeCursor(last.ts, last.id) : null };
}
