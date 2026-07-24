import { describe, it, expect, beforeEach } from "vitest";
import { truncateLedger } from "../../../test/db.js";
import { db } from "../../db/client.js";
import { ledgerEntries } from "../../db/schema.js";

describe("harness", () => {
  beforeEach(truncateLedger);
  it("bos tablo", async () => {
    const rows = await db.select().from(ledgerEntries);
    expect(rows).toHaveLength(0);
  });
});
