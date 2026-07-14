// Is -> saglayici/model eslemesi (Bolum 9.1). Yarin Anthropic eklemek = burada 1 satir + yeni provider.
import type { AiPurpose } from "@hayatos/shared";

export type AiRole = "parse" | "deep" | "auditor" | "auditorFallback" | "lifequery";

interface RouteTarget {
  providerName: string;
  model: string;
  purpose: AiPurpose; // hangi tavana sayilir
}

export const ROUTING: Record<AiRole, RouteTarget> = {
  parse: { providerName: "vertex-flash", model: "gemini-2.0-flash", purpose: "parse" },
  deep: { providerName: "vertex-pro", model: "gemini-2.5-pro", purpose: "deep" },
  // auditor Faz 3'te OpenRouter'a gecer; simdilik Pro yedegi.
  auditor: { providerName: "vertex-pro", model: "gemini-2.5-pro", purpose: "auditor" },
  auditorFallback: { providerName: "vertex-pro", model: "gemini-2.5-pro", purpose: "auditor" },
  lifequery: { providerName: "vertex-flash", model: "gemini-2.0-flash", purpose: "parse" },
};
