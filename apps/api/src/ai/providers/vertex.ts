// Vertex AI saglayicisi. Faz 0'da yalniz health() gercek (complete/parse Faz 1).
// health: GCP kimligi cozulup access token alinabiliyor mu? Bu, metering + baglanti telini kanitlar.
import { GoogleAuth } from "google-auth-library";
import type { AiProvider, HealthResult, AiOp } from "../provider.js";
import { defineOp } from "../provider.js";
import { env } from "../../env.js";

let authClient: GoogleAuth | null = null;
function auth(): GoogleAuth {
  authClient ??= new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
  return authClient;
}

export class VertexProvider implements AiProvider {
  readonly name = "vertex";

  health(): AiOp<HealthResult> {
    return defineOp<HealthResult>(
      { purpose: "parse", provider: this.name, model: "vertex-health" },
      async () => {
        if (!env.GCP_PROJECT_ID) {
          return { result: { ok: false, detail: "GCP_PROJECT_ID tanimli degil" } };
        }
        try {
          const token = await auth().getAccessToken();
          const ok = Boolean(token);
          return {
            result: {
              ok,
              detail: ok
                ? `vertex erisilebilir (proje ${env.GCP_PROJECT_ID}, ${env.GCP_LOCATION})`
                : "access token alinamadi",
            },
          };
        } catch (err) {
          return {
            result: {
              ok: false,
              detail: `kimlik cozulemedi: ${err instanceof Error ? err.message : String(err)}`,
            },
          };
        }
      },
    );
  }
}

export const vertex = new VertexProvider();
