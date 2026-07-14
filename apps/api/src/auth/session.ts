// Oturum: httpOnly + secure + sameSite=strict cookie, kisa omurlu JWT (Bolum 10).
import { createHash } from "node:crypto";
import type { Context } from "hono";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
import { env } from "../env.js";

const COOKIE = "hayatos_session";
const TTL_SECONDS = 7 * 24 * 60 * 60; // 7 gun
// Oturum imza sirri master key'den turetilir (ayri sir tutmamak icin).
const SECRET = createHash("sha256").update(env.SODIUM_MASTER_KEY).digest("hex");
const isLocalhost = env.DOMAIN === "localhost";

interface SessionPayload {
  sub: string; // user id
  iat: number;
  exp: number;
  [key: string]: unknown;
}

export async function issueSession(c: Context, userId: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const token = await sign({ sub: userId, iat: now, exp: now + TTL_SECONDS }, SECRET, "HS256");
  setCookie(c, COOKIE, token, {
    httpOnly: true,
    secure: !isLocalhost, // localhost'ta http, uretimde https
    sameSite: "Strict",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function readSession(c: Context): Promise<SessionPayload | null> {
  const token = getCookie(c, COOKIE);
  if (!token) return null;
  try {
    return (await verify(token, SECRET, "HS256")) as SessionPayload;
  } catch {
    return null;
  }
}

export function clearSession(c: Context): void {
  deleteCookie(c, COOKIE, { path: "/" });
}

/** Localhost'ta birden fazla dev origin'i, uretimde tek https origin. */
export function expectedOrigins(): string[] {
  if (isLocalhost) {
    return [
      "http://localhost",
      "http://localhost:3000",
      "http://localhost:4173",
      "http://localhost:5173",
    ];
  }
  return [`https://${env.DOMAIN}`];
}

export const rpID = env.DOMAIN;
export const rpName = "Hayat OS";
