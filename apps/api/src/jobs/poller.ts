// Postgres tabanli zamanlayici (Bolum 4). 30sn'de bir due job tarar. Redis yok.
// VM restart'ta kacan isler (run_after gecmis, done_at null) otomatik secilir => telafi.
import { and, isNull, lte, lt, or, eq, sql as dsql } from "drizzle-orm";
import type { JobResult } from "@hayatos/shared";
import { db } from "../db/client.js";
import { jobs } from "../db/schema.js";
import { runBackup } from "./backup.js";

const TICK_MS = 30_000;
const LEASE_MS = 5 * 60_000; // bir is en fazla 5 dk kilitli kalir

/** Is adi -> calisici. Ince tut: asil mantik modul servisinde (job = tetikleyici). */
const handlers: Record<string, (payload: unknown) => Promise<JobResult>> = {
  backup: () => runBackup(),
};

// ---- Saf secim mantigi (birim testli) ----
export interface DueCandidate {
  doneAt: Date | null;
  runAfter: Date;
  lockedUntil: Date | null;
}
export function isDue(job: DueCandidate, now: Date): boolean {
  if (job.doneAt !== null) return false;
  if (job.runAfter > now) return false;
  if (job.lockedUntil !== null && job.lockedUntil >= now) return false;
  return true;
}
export function selectDue<T extends DueCandidate>(candidates: T[], now: Date): T[] {
  return candidates.filter((j) => isDue(j, now));
}

// ---- Zamanlama yardimcilari ----
/** Bir sonraki 03:30 (sunucu yerel saati; compose TZ=Europe/Istanbul). */
export function next0330(from = new Date()): Date {
  const d = new Date(from);
  d.setHours(3, 30, 0, 0);
  if (d <= from) d.setDate(d.getDate() + 1);
  return d;
}

export async function enqueue(name: string, runAfter = new Date(), payload?: unknown): Promise<void> {
  await db.insert(jobs).values({ name, runAfter, payload: payload ?? null });
}

/** Bekleyen backup yoksa bir sonraki 03:30'a planla (boot'ta cagrilir). */
export async function ensureBackupScheduled(): Promise<void> {
  const pending = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(and(eq(jobs.name, "backup"), isNull(jobs.doneAt)))
    .limit(1);
  if (pending.length === 0) await enqueue("backup", next0330());
}

/** Due isleri atomik kilitle ve dondur. */
async function claimDue(now: Date): Promise<{ id: string; name: string; payload: unknown }[]> {
  const leaseUntil = new Date(now.getTime() + LEASE_MS);
  const claimed = await db
    .update(jobs)
    .set({ lockedUntil: leaseUntil })
    .where(
      and(
        isNull(jobs.doneAt),
        lte(jobs.runAfter, now),
        or(isNull(jobs.lockedUntil), lt(jobs.lockedUntil, now)),
      ),
    )
    .returning({ id: jobs.id, name: jobs.name, payload: jobs.payload });
  return claimed;
}

async function runOne(job: { id: string; name: string; payload: unknown }): Promise<void> {
  const handler = handlers[job.name];
  if (!handler) {
    await db
      .update(jobs)
      .set({ lastError: `unknown job: ${job.name}`, lockedUntil: null, attempts: dsql`${jobs.attempts} + 1` })
      .where(eq(jobs.id, job.id));
    return;
  }
  try {
    const result = await handler(job.payload);
    await db
      .update(jobs)
      .set({ doneAt: new Date(), lastError: result.ok ? null : (result.detail ?? "failed"), lockedUntil: null })
      .where(eq(jobs.id, job.id));
    // Tekrarlayan is: backup her gece 03:30.
    if (job.name === "backup") await enqueue("backup", next0330());
  } catch (err) {
    await db
      .update(jobs)
      .set({
        lastError: err instanceof Error ? err.message : String(err),
        lockedUntil: null,
        attempts: dsql`${jobs.attempts} + 1`,
      })
      .where(eq(jobs.id, job.id));
  }
}

export async function tick(): Promise<void> {
  const now = new Date();
  const due = await claimDue(now);
  for (const job of due) await runOne(job);
}

let timer: ReturnType<typeof setInterval> | null = null;
export function startPoller(): void {
  if (timer) return;
  timer = setInterval(() => {
    tick().catch((e) => console.error("[poller] tick error:", e));
  }, TICK_MS);
  // Boot'ta hemen bir tur (kacanlari topla).
  tick().catch((e) => console.error("[poller] boot tick error:", e));
}
export function stopPoller(): void {
  if (timer) clearInterval(timer);
  timer = null;
}
