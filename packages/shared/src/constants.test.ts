import { describe, it, expect } from "vitest";
import { AI_PURPOSES, AI_CAP_ENV, CATEGORIES } from "./constants.js";

describe("constants", () => {
  it("her AI amacinin bir tavan env eslemesi var", () => {
    for (const p of AI_PURPOSES) {
      expect(AI_CAP_ENV[p]).toMatch(/_DAILY_CAP$/);
    }
  });

  it("kategoriler benzersiz", () => {
    expect(new Set(CATEGORIES).size).toBe(CATEGORIES.length);
  });
});
