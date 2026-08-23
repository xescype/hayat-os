import { useEffect, useRef, useState } from "react";
import { Card, Button, Input, LedgerRow } from "../components/ui.js";
import { ledgerApi, type LedgerRow as Row } from "../lib/ledger.js";

export default function Defter() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [note, setNote] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function load(query = "") {
    try {
      const page = await ledgerApi.list({ q: query || undefined });
      setRows(page.rows);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Defter yuklenemedi.");
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function onSearch(value: string) {
    setQ(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => load(value), 250);
  }

  async function addNote() {
    const t = note.trim();
    if (!t || busy) return;
    setBusy(true);
    try {
      await ledgerApi.note(t);
      setNote("");
      await load(q);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Not eklenemedi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <Card className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Not yaz..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
          />
          <Button onClick={addNote} disabled={!note.trim() || busy}>
            Ekle
          </Button>
        </div>
        <Input placeholder="Ara..." value={q} onChange={(e) => onSearch(e.target.value)} />
      </Card>

      {error && (
        <div className="text-sm text-accent border border-accent-deep rounded px-3 py-2">
          {error}
        </div>
      )}

      <Card>
        {!loaded ? (
          <div className="text-sm text-text-dim">Yukleniyor...</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-text-faint">
            {q ? "Bu filtreyle kayit yok." : "Defter bos — ilk notu yaz."}
          </div>
        ) : (
          rows.map((r) => (
            <LedgerRow
              key={r.id}
              ts={r.ts}
              channel={r.channel}
              sen={r.rawInput}
              sistem={r.responseText}
              sensitive={r.sensitivity === "sensitive"}
            />
          ))
        )}
      </Card>
    </div>
  );
}
