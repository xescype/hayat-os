import { useEffect, useState } from "react";
import { Card, Button, Input, Badge, Divider } from "./components/ui.js";
import { register, login, me } from "./auth/webauthn.js";
import { subscribePush } from "./push/register.js";
import { api } from "./lib/api.js";

type View = "loading" | "auth" | "in";

export default function App() {
  const [view, setView] = useState<View>("loading");
  const [setupToken, setSetupToken] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    me().then((r) => setView(r.authenticated ? "in" : "auth"));
  }, []);

  async function guard(fn: () => Promise<void>, ok: string) {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg(ok);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Hata.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <header className="space-y-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-text">Hayat OS</h1>
            <Badge>Faz 0</Badge>
          </div>
          <p className="text-sm text-text-dim">Kisisel hayat isletim sistemi — iskelet.</p>
        </header>

        {view === "loading" && <Card>Yukleniyor...</Card>}

        {view === "auth" && (
          <Card className="space-y-3">
            <label className="block text-xs text-text-faint tracking-tight">
              Kurulum anahtari (ilk kayit icin)
            </label>
            <Input
              type="password"
              placeholder="SETUP_TOKEN"
              value={setupToken}
              onChange={(e) => setSetupToken(e.target.value)}
            />
            <Button
              disabled={busy || setupToken.length < 16}
              onClick={() =>
                guard(() => register(setupToken), "Kayit tamam — passkey olusturuldu.").then(() =>
                  me().then((r) => r.authenticated && setView("in")),
                )
              }
            >
              Passkey ile kayit ol
            </Button>
            <Divider />
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() =>
                guard(login, "Giris basarili.").then(() =>
                  me().then((r) => r.authenticated && setView("in")),
                )
              }
            >
              Passkey ile giris yap
            </Button>
          </Card>
        )}

        {view === "in" && (
          <Card className="space-y-4">
            <div>
              <div className="text-xs text-text-faint tracking-tight">Bugun kayit</div>
              <div className="num-star text-text">0</div>
            </div>
            <Divider />
            <div className="space-y-2">
              <Button
                disabled={busy}
                onClick={() =>
                  guard(subscribePush, "Bildirim aboneligi kaydedildi.")
                }
              >
                Bildirimi ac
              </Button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() =>
                  guard(async () => {
                    const r = await api.post<{ sent: number; failed: number }>("/push/test");
                    setMsg(`Gonderildi: ${r.sent}, basarisiz: ${r.failed}`);
                  }, "Test bildirimi gonderildi.")
                }
              >
                Test bildirimi gonder
              </Button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() =>
                  guard(async () => {
                    await api.post("/jobs/backup");
                  }, "Yedek kuyruklandi (en gec 30sn).")
                }
              >
                Yedek al (kuyruga)
              </Button>
            </div>
            <Divider />
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() =>
                guard(async () => {
                  await api.post("/auth/logout");
                }, "Cikis yapildi.").then(() => setView("auth"))
              }
            >
              Cikis yap
            </Button>
          </Card>
        )}

        {msg && (
          <div className="text-sm text-accent border border-accent-deep rounded px-3 py-2 animate-stagger-in">
            {msg}
          </div>
        )}
      </div>
    </main>
  );
}
