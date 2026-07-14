import { describe, it, expect } from "vitest";
import { runMetering, CapExceededError, type MeterStore, type AiCallRecord } from "./withMetering.js";
import { defineOp } from "./provider.js";

function memStore(initialCount: number): { store: MeterStore; records: AiCallRecord[] } {
  const records: AiCallRecord[] = [];
  return {
    records,
    store: {
      countToday: async () => initialCount,
      record: async (e) => {
        records.push(e);
      },
    },
  };
}

describe("runMetering", () => {
  it("tavan asilinca reddeder ve cagriyi CALISTIRMAZ", async () => {
    // parse tavani FLASH_DAILY_CAP=200 (varsayilan). count=200 => asildi.
    let ran = false;
    const op = defineOp<string>({ purpose: "parse", provider: "vertex", model: "m" }, async () => {
      ran = true;
      return { result: "x" };
    });
    const { store, records } = memStore(200);
    await expect(runMetering(op, store)).rejects.toBeInstanceOf(CapExceededError);
    expect(ran).toBe(false); // sayacsiz cagri yok
    expect(records).toHaveLength(0); // reddedilen cagri kayit uretmez
  });

  it("basarili cagriyi kaydeder (ok=true)", async () => {
    const op = defineOp<number>({ purpose: "parse", provider: "vertex", model: "m" }, async () => ({
      result: 42,
      inputTokens: 10,
      outputTokens: 5,
    }));
    const { store, records } = memStore(0);
    const result = await runMetering(op, store);
    expect(result).toBe(42);
    expect(records).toHaveLength(1);
    expect(records[0]!.ok).toBe(true);
    expect(records[0]!.inputTokens).toBe(10);
  });

  it("cagri hata verirse ok=false kaydeder ve firlatir", async () => {
    const op = defineOp<never>({ purpose: "parse", provider: "vertex", model: "m" }, async () => {
      throw new Error("model patladi");
    });
    const { store, records } = memStore(0);
    await expect(runMetering(op, store)).rejects.toThrow("model patladi");
    expect(records).toHaveLength(1);
    expect(records[0]!.ok).toBe(false);
    expect(records[0]!.error).toContain("patladi");
  });
});
