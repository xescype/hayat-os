import { describe, it, expect, beforeEach } from "vitest";
import { truncateLedger } from "../../../test/db.js";
import { db } from "../../db/client.js";
import { ledgerEntries } from "../../db/schema.js";
import { and, eq, isNull } from "drizzle-orm";
import { writeLedger, supersede, getChain, listActive, search } from "./service.js";

describe("writeLedger", () => {
  beforeEach(truncateLedger);

  it("insert eder, id doner, sensitivity default normal", async () => {
    const { id } = await writeLedger({ channel: "text", actor: "user", raw_input: "Öğlen çorba" });
    const row = (await db.select().from(ledgerEntries).where(eq(ledgerEntries.id, id)))[0]!;
    expect(row.channel).toBe("text");
    expect(row.sensitivity).toBe("normal");
    expect(row.supersededBy).toBeNull();
  });

  it("search_norm ASCII-fold yazilir", async () => {
    const { id } = await writeLedger({ channel: "text", actor: "user", raw_input: "AĞRI İstanbul" });
    const row = (await db.select().from(ledgerEntries).where(eq(ledgerEntries.id, id)))[0]!;
    expect(row.searchNorm).toBe("agri istanbul");
  });

  it("gecersiz channel Zod ile reddedilir", async () => {
    // @ts-expect-error kasitli gecersiz
    await expect(writeLedger({ channel: "x", actor: "user" })).rejects.toThrow();
  });
});

describe("supersede", () => {
  beforeEach(truncateLedger);

  it("eskiyi SILMEZ, isaretler; aktif gorunumde yeni gorunur", async () => {
    const { id: a } = await writeLedger({ channel: "text", actor: "user", raw_input: "yanlis" });
    const { id: b } = await supersede(a, { channel: "text", actor: "user", raw_input: "dogru" });
    const rowA = (await db.select().from(ledgerEntries).where(eq(ledgerEntries.id, a)))[0]!;
    expect(rowA.supersededBy).toBe(b); // silinmedi, isaretlendi
    const active = await db.select().from(ledgerEntries).where(isNull(ledgerEntries.supersededBy));
    expect(active.map((r) => r.id)).toEqual([b]);
  });

  it("zincir A->B->C, aktif = C", async () => {
    const { id: a } = await writeLedger({ channel: "text", actor: "user", raw_input: "A" });
    const { id: b } = await supersede(a, { channel: "text", actor: "user", raw_input: "B" });
    const { id: c } = await supersede(b, { channel: "text", actor: "user", raw_input: "C" });
    const chain = await getChain(a);
    expect(chain.map((r) => r.rawInput)).toEqual(["A", "B", "C"]);
    const active = await db.select().from(ledgerEntries).where(isNull(ledgerEntries.supersededBy));
    expect(active.map((r) => r.id)).toEqual([c]);
  });

  it("zaten-superseded'e supersede reddedilir, sarkan satir birakmaz", async () => {
    const { id: a } = await writeLedger({ channel: "text", actor: "user", raw_input: "A" });
    await supersede(a, { channel: "text", actor: "user", raw_input: "B" });
    const before = (await db.select().from(ledgerEntries)).length;
    await expect(supersede(a, { channel: "text", actor: "user", raw_input: "C" })).rejects.toThrow();
    const after = (await db.select().from(ledgerEntries)).length;
    expect(after).toBe(before); // rollback: yeni satir yok
  });
});

describe("listActive + search", () => {
  beforeEach(truncateLedger);

  it("listActive superseded haric, ts desc", async () => {
    const { id: a } = await writeLedger({ channel: "text", actor: "user", raw_input: "eski" });
    await supersede(a, { channel: "text", actor: "user", raw_input: "yeni" });
    await writeLedger({ channel: "system", actor: "system", response_text: "sistem" });
    const { rows } = await listActive({ limit: 10 });
    const texts = rows.map((r) => r.rawInput ?? r.responseText);
    expect(texts).toContain("yeni");
    expect(texts).toContain("sistem");
    expect(texts).not.toContain("eski");
  });

  it("Turkce arama vakalari", async () => {
    await writeLedger({ channel: "text", actor: "user", raw_input: "İstanbul'a gittim" });
    await writeLedger({ channel: "text", actor: "user", raw_input: "ANTRENMANIMDAKİ agirlik" });
    await writeLedger({ channel: "text", actor: "user", raw_input: "omuz ağrısı basladi" });
    expect((await search({ q: "istanbul" })).rows).toHaveLength(1);
    expect((await search({ q: "antrenman" })).rows).toHaveLength(1);
    expect((await search({ q: "agri" })).rows).toHaveLength(1);
  });

  it("kanal filtresi", async () => {
    await writeLedger({ channel: "text", actor: "user", raw_input: "not" });
    await writeLedger({ channel: "system", actor: "system", response_text: "olay" });
    expect((await search({ channel: "system" })).rows).toHaveLength(1);
  });
});
