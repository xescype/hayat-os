// Web Push (VAPID). Anahtarlar backend'de. Bildirim gonderimi + notifications_log kaydi tek yerden.
import webpush from "web-push";
import { db } from "../db/client.js";
import { notificationsLog, pushSubscriptions } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { env } from "../env.js";

webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC, env.VAPID_PRIVATE);

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export interface PushOutcome {
  sent: number;
  failed: number;
}

/**
 * Tum kayitli aboneliklere gonderir. Olu abonelikleri (404/410) temizler.
 * Sonucu notifications_log'a yazar (Bolum 8.9: her bildirim loglanir).
 */
export async function pushToAll(kind: string, payload: PushPayload): Promise<PushOutcome> {
  const subs = await db.select().from(pushSubscriptions);
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
        );
        sent++;
      } catch (err: unknown) {
        failed++;
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, s.id));
        }
      }
    }),
  );

  await db.insert(notificationsLog).values({
    kind,
    title: payload.title,
    body: payload.body,
    ok: failed === 0,
    error: failed > 0 ? `${failed} abonelige ulasilamadi` : null,
    meta: { sent, failed, subscribers: subs.length },
  });

  return { sent, failed };
}
