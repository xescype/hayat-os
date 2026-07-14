// WebAuthn istemci akisi (@simplewebauthn/browser). Sunucu uclariyla konusur.
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { api } from "../lib/api.js";

export async function register(setupToken: string, displayName = "Esat"): Promise<void> {
  const options = await api.post<Record<string, unknown>>("/auth/register/start", {
    setupToken,
    displayName,
  });
  const attResp = await startRegistration({ optionsJSON: options as never });
  await api.post("/auth/register/finish", attResp);
}

export async function login(): Promise<void> {
  const options = await api.post<Record<string, unknown>>("/auth/login/start", {});
  const authResp = await startAuthentication({ optionsJSON: options as never });
  await api.post("/auth/login/finish", authResp);
}

export async function me(): Promise<{ authenticated: boolean; userId?: string }> {
  try {
    return await api.get("/auth/me");
  } catch {
    return { authenticated: false };
  }
}
