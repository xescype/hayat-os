// WebAuthn/passkey (Bolum 4/10). Kayit setup token ile korunur ve ILK passkey sonrasi KAPANIR.
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { credentials, users } from "../db/schema.js";
import { expectedOrigins, rpID, rpName } from "./session.js";

// Kisa omurlu challenge deposu (tek kullanici, tek surec => bellek yeter). flowId cookie ile eslesir.
const challenges = new Map<string, { challenge: string; expires: number }>();
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

function putChallenge(flowId: string, challenge: string): void {
  challenges.set(flowId, { challenge, expires: Date.now() + CHALLENGE_TTL_MS });
}
function takeChallenge(flowId: string): string | null {
  const e = challenges.get(flowId);
  challenges.delete(flowId);
  if (!e || e.expires < Date.now()) return null;
  return e.challenge;
}

/** Kayit acik mi? Ilk credential olusunca kapanir. */
export async function registrationOpen(): Promise<boolean> {
  const existing = await db.select({ id: credentials.id }).from(credentials).limit(1);
  return existing.length === 0;
}

export async function startRegistration(flowId: string, displayName: string) {
  // Tek kullanici: sabit bir userID kullan (varsa mevcut, yoksa yeni uuid uret gibi degil —
  // options icin rastgele yeter; kaydi finish'te olustururuz).
  const userIdBytes = crypto.getRandomValues(new Uint8Array(16));
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: userIdBytes,
    userName: displayName,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "required",
    },
  });
  putChallenge(flowId, options.challenge);
  return options;
}

export async function finishRegistration(flowId: string, response: unknown, displayName: string) {
  const expectedChallenge = takeChallenge(flowId);
  if (!expectedChallenge) throw new Error("challenge yok veya suresi doldu");

  const verification = await verifyRegistrationResponse({
    response: response as never,
    expectedChallenge,
    expectedOrigin: expectedOrigins(),
    expectedRPID: rpID,
    requireUserVerification: true,
  });
  if (!verification.verified || !verification.registrationInfo) {
    throw new Error("kayit dogrulanamadi");
  }

  const { credential } = verification.registrationInfo;
  // Tek kullanici: kullanici yoksa olustur.
  let user = (await db.select().from(users).limit(1))[0];
  if (!user) {
    user = (await db.insert(users).values({ displayName }).returning())[0]!;
  }

  await db.insert(credentials).values({
    id: credential.id,
    userId: user.id,
    publicKey: isoBase64URL.fromBuffer(credential.publicKey),
    counter: credential.counter,
    transports: credential.transports ?? null,
  });

  return { userId: user.id };
}

export async function startAuthentication(flowId: string) {
  const creds = await db.select().from(credentials);
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "required",
    allowCredentials: creds.map((c) => ({
      id: c.id,
      transports: (c.transports ?? undefined) as never,
    })),
  });
  putChallenge(flowId, options.challenge);
  return options;
}

export async function finishAuthentication(flowId: string, response: unknown) {
  const expectedChallenge = takeChallenge(flowId);
  if (!expectedChallenge) throw new Error("challenge yok veya suresi doldu");

  const resp = response as { id: string };
  const cred = (await db.select().from(credentials).where(eq(credentials.id, resp.id)))[0];
  if (!cred) throw new Error("credential bulunamadi");

  const verification = await verifyAuthenticationResponse({
    response: response as never,
    expectedChallenge,
    expectedOrigin: expectedOrigins(),
    expectedRPID: rpID,
    requireUserVerification: true,
    credential: {
      id: cred.id,
      publicKey: isoBase64URL.toBuffer(cred.publicKey),
      counter: cred.counter,
      transports: (cred.transports ?? undefined) as never,
    },
  });
  if (!verification.verified) throw new Error("giris dogrulanamadi");

  await db
    .update(credentials)
    .set({ counter: verification.authenticationInfo.newCounter })
    .where(eq(credentials.id, cred.id));

  return { userId: cred.userId };
}
