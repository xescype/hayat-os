// Faz 0 asgari sema (Bolum 6 isimlendirme ruhu korunur). Kalan tablolar sonraki fazlarda.
import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  numeric,
  index,
} from "drizzle-orm/pg-core";

/** Tek satir olacak ama tablo yine de var (ileride veri modeli bozulmasin). */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** WebAuthn credential kayitlari (Bolum 10). publicKey base64url metin, counter integer. */
export const credentials = pgTable("credentials", {
  id: text("id").primaryKey(), // credential ID (base64url)
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  publicKey: text("public_key").notNull(), // base64url
  counter: integer("counter").notNull().default(0),
  transports: jsonb("transports").$type<string[]>(),
  deviceLabel: text("device_label"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Web Push abonelikleri. Iki cihaz da kaydolabilir; endpoint benzersiz. */
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  deviceLabel: text("device_label"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Bildirim gunlugu (Bolum 8.9). Faz 0'da yedek sonucu da buraya dusulur. */
export const notificationsLog = pgTable("notifications_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  ts: timestamp("ts", { withTimezone: true }).defaultNow().notNull(),
  kind: text("kind").notNull(), // test | backup | ...
  title: text("title").notNull(),
  body: text("body"),
  ok: boolean("ok").notNull().default(true),
  error: text("error"),
  meta: jsonb("meta"),
});

/** HER model cagrisi (Bolum 9.4). Kota sayaclari + maliyet gorunurlugu buradan. */
export const aiCalls = pgTable(
  "ai_calls",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ts: timestamp("ts", { withTimezone: true }).defaultNow().notNull(),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    purpose: text("purpose").notNull(), // AiPurpose
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    estCost: numeric("est_cost", { precision: 12, scale: 6 }).notNull().default("0"),
    durationMs: integer("duration_ms").notNull().default(0),
    ok: boolean("ok").notNull(),
    error: text("error"),
  },
  (t) => [index("ai_calls_purpose_ts_idx").on(t.purpose, t.ts)],
);

/** Zamanlayici kuyrugu (Bolum 4). Postgres tabanli, Redis yok. Idempotent isler. */
export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    payload: jsonb("payload"),
    runAfter: timestamp("run_after", { withTimezone: true }).defaultNow().notNull(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    doneAt: timestamp("done_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("jobs_due_idx").on(t.doneAt, t.runAfter)],
);

/** Defter: append-only olay gunlugu (Bolum 1A). Trigger ile korunur, satirlar hic silinmez/degismez. */
export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ts: timestamp("ts", { withTimezone: true }).defaultNow().notNull(),
    channel: text("channel").notNull(),
    actor: text("actor").notNull(),
    rawInput: text("raw_input"),
    interpretation: jsonb("interpretation"),
    moduleWrites: jsonb("module_writes").$type<{ table: string; id: string }[]>(),
    responseText: text("response_text"),
    audioRef: text("audio_ref"),
    sensitivity: text("sensitivity").notNull().default("normal"),
    searchNorm: text("search_norm"),
    supersededBy: uuid("superseded_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("ledger_ts_idx").on(t.ts.desc()),
    index("ledger_channel_idx").on(t.channel, t.ts.desc()),
    index("ledger_superseded_idx").on(t.supersededBy),
  ],
);
