// Gece yedegi (Bolum 11): pg_dump -Fc -> tar -> age sifreleme -> GCS.
// Faz 0: sonuc notifications_log'a; basarisizlikta push (ledger+brifing Faz 1).
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Storage } from "@google-cloud/storage";
import type { JobResult } from "@hayatos/shared";
import { db } from "../db/client.js";
import { notificationsLog } from "../db/schema.js";
import { env } from "../env.js";
import { pushToAll } from "../push/vapid.js";
import { writeLedger } from "../modules/ledger/service.js";

const run = promisify(execFile);

async function record(ok: boolean, detail: string, meta?: unknown): Promise<void> {
  await db.insert(notificationsLog).values({
    kind: "backup",
    title: ok ? "Yedek alindi" : "Yedek BASARISIZ",
    body: detail,
    ok,
    error: ok ? null : detail,
    meta: meta ?? null,
  });
  // Omurga: yedek sonucu ledger'a da duser (Bolum 8.7). Best-effort; sessiz yutma yok.
  await writeLedger({
    channel: "system",
    actor: "system",
    response_text: ok ? `Yedek alindi: ${detail}` : `Yedek hatasi: ${detail}`,
    module_writes: meta ? [{ table: "gcs", id: String((meta as any).objectName ?? "?") }] : null,
  }).catch((e) => console.error("[ledger] yedek yazici basarisiz:", e));
  // Sessiz curuyen yedek, olmayan yedekten tehlikelidir => basarisizlikta dokun.
  if (!ok) {
    await pushToAll("backup", { title: "Oda — Yedek hatasi", body: detail, url: "/" }).catch(
      () => {},
    );
  }
}

export async function runBackup(): Promise<JobResult> {
  if (!env.GCS_BACKUP_BUCKET || !env.BACKUP_AGE_KEY) {
    const detail = "Yedek yapilandirmasi eksik (GCS_BACKUP_BUCKET / BACKUP_AGE_KEY).";
    await record(false, detail);
    return { ok: false, detail };
  }

  const dir = await mkdtemp(join(tmpdir(), "hayatos-backup-"));
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dumpPath = join(dir, "db.pgc");
  const tarPath = join(dir, `backup-${stamp}.tar`);
  const encPath = `${tarPath}.age`;
  const objectName = `backup-${stamp}.tar.age`;

  try {
    // 1) pg_dump (ozel format, sikistirilmis)
    await run("pg_dump", ["-Fc", "-f", dumpPath, env.DATABASE_URL]);
    // 2) tar (Faz 0: sadece dump; Faz 2'de sifreli uploads/ eklenir)
    await run("tar", ["-cf", tarPath, "-C", dir, "db.pgc"]);
    // 3) age sifreleme (recipient = BACKUP_AGE_KEY public)
    await run("age", ["-r", env.BACKUP_AGE_KEY, "-o", encPath, tarPath]);
    // 4) GCS yukleme
    const size = (await stat(encPath)).size;
    await new Storage()
      .bucket(env.GCS_BACKUP_BUCKET)
      .upload(encPath, { destination: objectName, resumable: false });

    const detail = `${objectName} yuklendi (${size} bayt).`;
    await record(true, detail, { objectName, size });
    return { ok: true, detail };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    await record(false, `Yedek hatasi: ${detail}`);
    return { ok: false, detail };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
