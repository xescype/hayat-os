// Push uclari: VAPID public anahtari, abonelik kaydi, test bildirimi (Faz 0 kabul kriteri).
import { Hono } from "hono";
import { pushSubscriptionSchema } from "@hayatos/shared";
import { db } from "../db/client.js";
import { pushSubscriptions } from "../db/schema.js";
import { env } from "../env.js";
import { readSession } from "../auth/session.js";
import { pushToAll } from "../push/vapid.js";

export const push = new Hono();

// Frontend'e giden tek mesru "sir": VAPID public key.
push.get("/vapid-public", (c) => c.json({ key: env.VAPID_PUBLIC }));

push.post("/subscribe", async (c) => {
  if (!(await readSession(c))) {
    return c.json({ error: "unauthorized", message: "Once giris yapmalisin." }, 401);
  }
  const parsed = pushSubscriptionSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) return c.json({ error: "bad_request", message: "Gecersiz abonelik." }, 400);
  const s = parsed.data;
  const label = c.req.header("user-agent")?.slice(0, 120) ?? null;

  // endpoint benzersiz => varsa guncelle, yoksa ekle (idempotent).
  await db
    .insert(pushSubscriptions)
    .values({ endpoint: s.endpoint, p256dh: s.keys.p256dh, auth: s.keys.auth, deviceLabel: label })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { p256dh: s.keys.p256dh, auth: s.keys.auth, deviceLabel: label },
    });

  return c.json({ ok: true });
});

push.post("/test", async (c) => {
  if (!(await readSession(c))) {
    return c.json({ error: "unauthorized", message: "Once giris yapmalisin." }, 401);
  }
  const outcome = await pushToAll("test", {
    title: "Oda",
    body: "Test bildirimi calisiyor.",
    url: "/",
  });
  return c.json(outcome);
});
