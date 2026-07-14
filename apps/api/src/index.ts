// HAYAT OS API boot: migrate -> zamanlayici -> serve. (Bolum 5 iskelet.)
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./env.js";
import { runMigrations } from "./db/migrate.js";
import { ensureBackupScheduled, startPoller, enqueue } from "./jobs/poller.js";
import { auth } from "./routes/auth.js";
import { push } from "./routes/push.js";
import { readSession } from "./auth/session.js";
import { vertex } from "./ai/providers/vertex.js";
import { runMetering } from "./ai/withMetering.js";
import { expectedOrigins } from "./auth/session.js";

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: expectedOrigins(),
    credentials: true,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/api/health", (c) => c.json({ ok: true, ts: new Date().toISOString() }));

// AI teli kaniti: vertex.health() SADECE runMetering'den gecebilir; ai_calls'a satir yazar.
app.get("/api/ai/health", async (c) => {
  try {
    const result = await runMetering(vertex.health());
    return c.json(result);
  } catch (err) {
    return c.json(
      { error: "ai_error", message: err instanceof Error ? err.message : "Hata." },
      500,
    );
  }
});

// Yedegi elle kuyruga at (Faz 0 dogrulama). Poller 30sn icinde calistirir.
app.post("/api/jobs/backup", async (c) => {
  if (!(await readSession(c))) {
    return c.json({ error: "unauthorized", message: "Once giris yapmalisin." }, 401);
  }
  await enqueue("backup", new Date());
  return c.json({ ok: true, message: "Yedek kuyruklandi (en gec 30sn icinde calisir)." });
});

app.route("/api/auth", auth);
app.route("/api/push", push);

async function boot(): Promise<void> {
  await runMigrations();
  await ensureBackupScheduled();
  startPoller();
  serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    console.log(`[api] listening on http://localhost:${info.port} (env=${env.NODE_ENV}, tz=${env.TZ})`);
  });
}

boot().catch((err) => {
  console.error("[api] boot failed:", err);
  process.exit(1);
});
