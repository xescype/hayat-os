import { describe, it, expect, beforeEach } from "vitest";
import { truncateLedger } from "../../../test/db.js";
import { db } from "../../db/client.js";
import { ledgerEntries } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { writeLedger } from "./service.js";

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
