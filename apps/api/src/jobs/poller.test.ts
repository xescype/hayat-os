import { describe, it, expect } from "vitest";
import { isDue, selectDue, next0330, type DueCandidate } from "./poller.js";

const now = new Date("2026-07-14T10:00:00Z");

describe("poller secim mantigi", () => {
  it("due: done_at null + run_after gecmis + kilit yok", () => {
    const j: DueCandidate = { doneAt: null, runAfter: new Date("2026-07-14T09:00:00Z"), lockedUntil: null };
    expect(isDue(j, now)).toBe(true);
  });

  it("bitmis is due degil", () => {
    const j: DueCandidate = { doneAt: new Date(), runAfter: new Date("2026-07-14T09:00:00Z"), lockedUntil: null };
    expect(isDue(j, now)).toBe(false);
  });

  it("gelecekteki is due degil", () => {
    const j: DueCandidate = { doneAt: null, runAfter: new Date("2026-07-14T11:00:00Z"), lockedUntil: null };
    expect(isDue(j, now)).toBe(false);
  });

  it("kilitli (lease gecerli) is due degil", () => {
    const j: DueCandidate = {
      doneAt: null,
      runAfter: new Date("2026-07-14T09:00:00Z"),
      lockedUntil: new Date("2026-07-14T10:05:00Z"),
    };
    expect(isDue(j, now)).toBe(false);
  });

  it("kacan is (lease suresi gecmis) tekrar due => telafi", () => {
    const j: DueCandidate = {
      doneAt: null,
      runAfter: new Date("2026-07-14T08:00:00Z"),
      lockedUntil: new Date("2026-07-14T09:00:00Z"), // gecmiste kilit
    };
    expect(isDue(j, now)).toBe(true);
  });

  it("selectDue karisik listeden yalniz due olanlari secer", () => {
    const list: DueCandidate[] = [
      { doneAt: null, runAfter: new Date("2026-07-14T09:00:00Z"), lockedUntil: null }, // due
      { doneAt: new Date(), runAfter: new Date("2026-07-14T09:00:00Z"), lockedUntil: null }, // bitmis
      { doneAt: null, runAfter: new Date("2026-07-14T12:00:00Z"), lockedUntil: null }, // gelecek
    ];
    expect(selectDue(list, now)).toHaveLength(1);
  });

  it("next0330 her zaman gelecekte ve 03:30", () => {
    const n = next0330(new Date("2026-07-14T10:00:00"));
    expect(n.getHours()).toBe(3);
    expect(n.getMinutes()).toBe(30);
    expect(n.getTime()).toBeGreaterThan(new Date("2026-07-14T10:00:00").getTime());
  });
});
