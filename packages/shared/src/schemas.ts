// Zod semalari — API sozlesmesinin TEK kaynagi. Dis dunyadan gelen her sey once buradan gecer.
import { z } from "zod";

/** Web Push abonelik govdesi (PushSubscription.toJSON cikti sekli). */
export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});
export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;

/** WebAuthn kayit baslatma: setup token ile korunur (Bolum 10). */
export const registerStartSchema = z.object({
  setupToken: z.string().min(16),
  displayName: z.string().min(1).max(64).default("Esat"),
});
export type RegisterStartInput = z.infer<typeof registerStartSchema>;

/** WebAuthn dogrulama cevabi (@simplewebauthn tarafindan uretilen JSON — genis tutulur). */
export const webauthnResponseSchema = z.object({
  id: z.string(),
  rawId: z.string(),
  type: z.literal("public-key"),
  response: z.record(z.unknown()),
  clientExtensionResults: z.record(z.unknown()).optional(),
  authenticatorAttachment: z.string().optional().nullable(),
});
export type WebauthnResponseInput = z.infer<typeof webauthnResponseSchema>;

/** Standart hata cevabi — kullaniciya giden mesaj Turkce (Bolum 0, Kural 1). */
export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
