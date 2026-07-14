// Model birim fiyatlari (USD / 1M token). Elle guncellenir (Bolum 9.4).
// Bilinmeyen model => muhafazakar (yuksek) varsayilan: surpriz iyimserlik yerine surpriz kotumserlik.

interface Price {
  inPerM: number; // input, USD / 1M token
  outPerM: number; // output, USD / 1M token
}

const TABLE: Record<string, Price> = {
  // Vertex / Gemini (yaklasik; guncelle)
  "gemini-2.0-flash": { inPerM: 0.1, outPerM: 0.4 },
  "gemini-2.5-pro": { inPerM: 1.25, outPerM: 5.0 },
  // health/no-op cagrilar
  "vertex-health": { inPerM: 0, outPerM: 0 },
};

const CONSERVATIVE_DEFAULT: Price = { inPerM: 10, outPerM: 30 };

/** est_cost (USD) hesapla. Token bilinmiyorsa 0 gelir => 0 maliyet. */
export function estimateCost(model: string, inputTokens = 0, outputTokens = 0): number {
  const p = TABLE[model] ?? CONSERVATIVE_DEFAULT;
  return (inputTokens / 1_000_000) * p.inPerM + (outputTokens / 1_000_000) * p.outPerM;
}
