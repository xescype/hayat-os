// Kimlik uclari. Mesajlar Turkce (kullaniciya gider). flowId cookie challenge'i eslestirir.
import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { registerStartSchema, webauthnResponseSchema } from "@hayatos/shared";
import { env } from "../env.js";
import {
  startRegistration,
  finishRegistration,
  startAuthentication,
  finishAuthentication,
  registrationOpen,
} from "../auth/webauthn.js";
import { issueSession, readSession, clearSession } from "../auth/session.js";
import { writeLedger } from "../modules/ledger/service.js";

const FLOW = "hayatos_flow";
const isLocalhost = env.DOMAIN === "localhost";

function ensureFlowId(c: import("hono").Context): string {
  let id = getCookie(c, FLOW);
  if (!id) {
    id = randomUUID();
    setCookie(c, FLOW, id, {
      httpOnly: true,
      secure: !isLocalhost,
      sameSite: "Strict",
      path: "/",
      maxAge: 600,
    });
  }
  return id;
}

export const auth = new Hono();

auth.post("/register/start", async (c) => {
  if (!(await registrationOpen())) {
    return c.json({ error: "registration_closed", message: "Kayit zaten yapilmis." }, 403);
  }
  const body = registerStartSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) {
    return c.json({ error: "bad_request", message: "Gecersiz istek." }, 400);
  }
  if (body.data.setupToken !== env.SETUP_TOKEN) {
    return c.json({ error: "bad_setup_token", message: "Kurulum anahtari hatali." }, 401);
  }
  const flowId = ensureFlowId(c);
  const options = await startRegistration(flowId, body.data.displayName);
  return c.json(options);
});

auth.post("/register/finish", async (c) => {
  if (!(await registrationOpen())) {
    return c.json({ error: "registration_closed", message: "Kayit zaten yapilmis." }, 403);
  }
  const flowId = getCookie(c, FLOW);
  if (!flowId) return c.json({ error: "no_flow", message: "Kayit akisi bulunamadi." }, 400);
  const parsed = webauthnResponseSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) return c.json({ error: "bad_request", message: "Gecersiz istek." }, 400);
  try {
    const { userId } = await finishRegistration(flowId, parsed.data, "Esat");
    await issueSession(c, userId);
    await writeLedger({ channel: "system", actor: "system", response_text: "Kayit tamamlandi" }).catch(
      (e) => console.error("[ledger] kayit yazici basarisiz:", e),
    );
    return c.json({ ok: true });
  } catch (err) {
    return c.json(
      { error: "verify_failed", message: err instanceof Error ? err.message : "Dogrulanamadi." },
      400,
    );
  }
});

auth.post("/login/start", async (c) => {
  const flowId = ensureFlowId(c);
  const options = await startAuthentication(flowId);
  return c.json(options);
});

auth.post("/login/finish", async (c) => {
  const flowId = getCookie(c, FLOW);
  if (!flowId) return c.json({ error: "no_flow", message: "Giris akisi bulunamadi." }, 400);
  const parsed = webauthnResponseSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) return c.json({ error: "bad_request", message: "Gecersiz istek." }, 400);
  try {
    const { userId } = await finishAuthentication(flowId, parsed.data);
    await issueSession(c, userId);
    await writeLedger({ channel: "system", actor: "system", response_text: "Giris yapildi" }).catch(
      (e) => console.error("[ledger] giris yazici basarisiz:", e),
    );
    return c.json({ ok: true });
  } catch (err) {
    return c.json(
      { error: "verify_failed", message: err instanceof Error ? err.message : "Dogrulanamadi." },
      401,
    );
  }
});

auth.get("/me", async (c) => {
  const session = await readSession(c);
  if (!session) return c.json({ authenticated: false }, 401);
  return c.json({ authenticated: true, userId: session.sub });
});

auth.post("/logout", (c) => {
  clearSession(c);
  return c.json({ ok: true });
});
