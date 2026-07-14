// Service worker kaydi + Web Push abonelagi.
import { api } from "../lib/api.js";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.register("/sw.js", { type: "classic" });
}

/** Push aboneligi olustur ve backend'e kaydet. Once giris + SW gerekir. */
export async function subscribePush(): Promise<void> {
  const reg = await navigator.serviceWorker.ready;
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Bildirim izni verilmedi.");

  const { key } = await api.get<{ key: string }>("/push/vapid-public");
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key),
  });
  await api.post("/push/subscribe", sub.toJSON());
}
