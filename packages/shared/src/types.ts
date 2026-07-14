// Ortak TS tipleri (semadan turemeyen). Semadan turemeler schemas.ts'te z.infer ile.

/** Su An karti sozlesmesi (Bolum 7) — Faz 1'de motor uretecek; sekil simdiden sabit. */
export interface NowCard {
  title: string;
  lines: string[]; // <= 3
  actions: { label: string; intent: string }[]; // <= 2
  tone: "normal" | "urgent" | "calm";
  sourceSignals: string[]; // hata ayiklama: kart neden bu kart
}

/** Job kaydinin calisma sonucu (Bolum 4/6 jobs). */
export interface JobResult {
  ok: boolean;
  detail?: string;
}
