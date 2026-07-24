import { describe, it, expect } from "vitest";
import { normalizeSearch } from "./normalize.js";

describe("normalizeSearch (Turkce-I ASCII fold)", () => {
  it("İ/I/ı hepsi i'ye katlanir", () => {
    expect(normalizeSearch("İstanbul")).toBe("istanbul");
    expect(normalizeSearch("ISTANBUL")).toBe("istanbul");
    expect(normalizeSearch("istanbul")).toBe("istanbul");
  });
  it("Turkce karakterler ASCII'ye", () => {
    expect(normalizeSearch("ağrı")).toBe("agri");
    expect(normalizeSearch("AĞRI")).toBe("agri");
    expect(normalizeSearch("Öğlen çorba şiş")).toBe("oglen corba sis");
  });
  it("İ combining-dot tuzagina dusmez", () => {
    // JS 'İ'.toLowerCase() => 'i̇' (i + U+0307); map ONCE lowercase'den once.
    expect(normalizeSearch("İ")).toBe("i");
    expect([...normalizeSearch("İ")].length).toBe(1);
  });
});
