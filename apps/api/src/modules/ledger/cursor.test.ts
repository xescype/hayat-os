import { describe, it, expect } from "vitest";
import { encodeCursor, decodeCursor } from "./cursor.js";

describe("cursor", () => {
  it("encode->decode round-trip", () => {
    const ts = new Date("2026-07-14T10:00:00.000Z");
    const c = encodeCursor(ts, "abc");
    const d = decodeCursor(c)!;
    expect(d.ts.toISOString()).toBe(ts.toISOString());
    expect(d.id).toBe("abc");
  });

  it("bozuk cursor null", () => {
    expect(decodeCursor("!!bozuk")).toBeNull();
  });
});
