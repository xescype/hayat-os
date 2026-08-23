// Defter API cagrilari (/api/ledger). Tipler route ciktisiyla eslesir.
import { api } from "./api.js";

export interface LedgerRow {
  id: string;
  ts: string;
  channel: string;
  actor: string;
  rawInput: string | null;
  responseText: string | null;
  sensitivity: string;
}

export interface Page {
  rows: LedgerRow[];
  nextCursor: string | null;
}

export const ledgerApi = {
  list: (params: { q?: string; channel?: string; cursor?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v) as [string, string][],
    ).toString();
    return api.get<Page>(`/ledger${qs ? `?${qs}` : ""}`);
  },
  note: (raw_input: string) =>
    api.post<{ ok: boolean; id: string }>("/ledger/note", { raw_input }),
};
