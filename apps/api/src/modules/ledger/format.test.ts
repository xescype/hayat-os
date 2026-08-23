import { describe, it, expect } from "vitest";
import { toPlainText } from "./format.js";

const mk = (o: Partial<any>) => ({
  ts: new Date("2026-07-13T06:42:00.000Z"),
  rawInput: null,
  responseText: null,
  ...o,
});

describe("toPlainText (Istanbul tz)", () => {
  it("baslik satiri + Istanbul saati (UTC 06:42 -> 09:42)", () => {
    const out = toPlainText(
      [mk({ rawInput: "merhaba" })],
      new Date("2026-07-01T00:00:00Z"),
      new Date("2026-07-14T00:00:00Z"),
    );
    expect(out.split("\n")[0]).toBe("Defter — 01.07.2026 → 14.07.2026, Europe/Istanbul");
    expect(out).toContain("13.07 09:42 — Sen: merhaba");
  });

  it("sistem satiri (raw_input yok)", () => {
    const out = toPlainText([mk({ responseText: "Yedek alindi" })]);
    expect(out).toContain("13.07 09:42 — Sistem: Yedek alindi");
  });

  it("hem Sen hem Sistem", () => {
    const out = toPlainText([mk({ rawInput: "soru", responseText: "cevap" })]);
    expect(out).toContain("13.07 09:42 — Sen: soru / Sistem: cevap");
  });
});
