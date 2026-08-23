import { describe, it, expect, beforeEach } from "vitest";
import { truncateLedger } from "../../../test/db.js";
import { db } from "../../db/client.js";
import { ledgerEntries } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { runBackup } from "../../jobs/backup.js";

describe("konvansiyon: kritik olaylar ledger'a duser", () => {
  beforeEach(truncateLedger);

  it("basarisiz yedek -> ledger hata satiri", async () => {
    // Test env'de GCS_BACKUP_BUCKET/BACKUP_AGE_KEY yok => yedek basarisiz.
    await runBackup();
    const rows = await db.select().from(ledgerEntries).where(eq(ledgerEntries.channel, "system"));
    const backupRows = rows.filter((r) => (r.responseText ?? "").toLowerCase().includes("yedek"));
    expect(backupRows.length).toBeGreaterThanOrEqual(1);
    expect(
      backupRows.some(
        (r) =>
          (r.responseText ?? "").toLowerCase().includes("hata") ||
          (r.responseText ?? "").toLowerCase().includes("basarisiz"),
      ),
    ).toBe(true);
  });
});
