import { describe, it, expect } from "vitest";
import { ledgerWriteSchema, noteInputSchema } from "./schemas.js";

describe("ledger schemas", () => {
  it("gecerli yazim kabul", () => {
    const r = ledgerWriteSchema.safeParse({ channel: "text", actor: "user", raw_input: "merhaba" });
    expect(r.success).toBe(true);
  });
  it("gecersiz channel red", () => {
    expect(ledgerWriteSchema.safeParse({ channel: "x", actor: "user" }).success).toBe(false);
  });
  it("note trim sonrasi bos red", () => {
    expect(noteInputSchema.safeParse({ raw_input: "   " }).success).toBe(false);
    expect(noteInputSchema.safeParse({ raw_input: " naber " }).success).toBe(true);
  });
});
