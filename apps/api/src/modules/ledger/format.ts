import type { LedgerRow } from "./service.js";

const TZ = "Europe/Istanbul";
const dt = new Intl.DateTimeFormat("tr-TR", {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
const dOnly = new Intl.DateTimeFormat("tr-TR", {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function line(r: Pick<LedgerRow, "ts" | "rawInput" | "responseText">): string {
  const parts = dt.formatToParts(r.ts);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const stamp = `${g("day")}.${g("month")} ${g("hour")}:${g("minute")}`;
  const segs: string[] = [];
  if (r.rawInput) segs.push(`Sen: ${r.rawInput}`);
  if (r.responseText) segs.push(`Sistem: ${r.responseText}`);
  return `${stamp} — ${segs.join(" / ")}`;
}

/** Insan okunur cizelge: baslik + aktif satirlar (Istanbul saati). */
export function toPlainText(
  rows: Pick<LedgerRow, "ts" | "rawInput" | "responseText">[],
  from?: Date,
  to?: Date,
): string {
  const header =
    from && to
      ? `Defter — ${dOnly.format(from)} → ${dOnly.format(to)}, Europe/Istanbul`
      : `Defter — tümü, Europe/Istanbul`;
  return [header, ...rows.map(line)].join("\n");
}
