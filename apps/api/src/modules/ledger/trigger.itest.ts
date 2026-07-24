import { describe, it, expect, beforeEach } from "vitest";
import { truncateLedger } from "../../../test/db.js";
import { db, sql } from "../../db/client.js";
import { ledgerEntries } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { writeLedger } from "./service.js";

describe("append-only trigger", () => {
  beforeEach(truncateLedger);

  it("icerik UPDATE reddedilir", async () => {
    const { id } = await writeLedger({ channel: "text", actor: "user", raw_input: "sabit" });
    await expect(
      db.update(ledgerEntries).set({ rawInput: "degistirildi" }).where(eq(ledgerEntries.id, id)),
    ).rejects.toThrow(/immutable/i);
  });

  it("DELETE reddedilir", async () => {
    const { id } = await writeLedger({ channel: "text", actor: "user", raw_input: "silinmez" });
    await expect(db.delete(ledgerEntries).where(eq(ledgerEntries.id, id))).rejects.toThrow(/append-only/i);
  });

  it("superseded_by NULL->id izinli (tek sefer)", async () => {
    const { id: a } = await writeLedger({ channel: "text", actor: "user", raw_input: "A" });
    const { id: b } = await writeLedger({ channel: "text", actor: "user", raw_input: "B" });
    await db.update(ledgerEntries).set({ supersededBy: b }).where(eq(ledgerEntries.id, a)); // izin
    await expect(
      db.update(ledgerEntries).set({ supersededBy: a }).where(eq(ledgerEntries.id, a)), // ikinci kez red
    ).rejects.toThrow(/superseded/i);
  });
});
