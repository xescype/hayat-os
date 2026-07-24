CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
-- ts = OLAY zamani (cevrimdisi senk gecmise yazabilir); created_at = DB insert ani (degismez).
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ts" timestamp with time zone DEFAULT now() NOT NULL,
	"channel" text NOT NULL,
	"actor" text NOT NULL,
	"raw_input" text,
	"interpretation" jsonb,
	"module_writes" jsonb,
	"response_text" text,
	"audio_ref" text,
	"sensitivity" text DEFAULT 'normal' NOT NULL,
	"search_norm" text,
	"superseded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ledger_channel_chk" CHECK ("channel" IN ('voice','text','button','system','ai')),
	CONSTRAINT "ledger_actor_chk" CHECK ("actor" IN ('user','flash','pro','auditor','system')),
	CONSTRAINT "ledger_sensitivity_chk" CHECK ("sensitivity" IN ('normal','sensitive')),
	CONSTRAINT "ledger_no_self_supersede" CHECK ("superseded_by" IS NULL OR "superseded_by" <> "id")
);
--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_superseded_fk" FOREIGN KEY ("superseded_by") REFERENCES "ledger_entries"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "ledger_ts_idx" ON "ledger_entries" USING btree ("ts" DESC);
--> statement-breakpoint
CREATE INDEX "ledger_active_idx" ON "ledger_entries" USING btree ("ts" DESC) WHERE "superseded_by" IS NULL;
--> statement-breakpoint
CREATE INDEX "ledger_channel_idx" ON "ledger_entries" USING btree ("channel","ts" DESC);
--> statement-breakpoint
CREATE INDEX "ledger_superseded_idx" ON "ledger_entries" USING btree ("superseded_by");
--> statement-breakpoint
CREATE INDEX "ledger_trgm_idx" ON "ledger_entries" USING gin ("search_norm" gin_trgm_ops);
--> statement-breakpoint
-- Append-only sigortasi: DELETE yasak; UPDATE yalniz superseded_by NULL->non-null.
CREATE OR REPLACE FUNCTION ledger_append_only() RETURNS trigger AS $$
BEGIN
	IF TG_OP = 'DELETE' THEN
		RAISE EXCEPTION 'ledger_entries append-only (DELETE yasak)';
	END IF;
	IF OLD.superseded_by IS NOT NULL THEN
		RAISE EXCEPTION 'ledger satiri zaten superseded (immutable)';
	END IF;
	IF NEW.id IS DISTINCT FROM OLD.id
		OR NEW.ts IS DISTINCT FROM OLD.ts
		OR NEW.channel IS DISTINCT FROM OLD.channel
		OR NEW.actor IS DISTINCT FROM OLD.actor
		OR NEW.raw_input IS DISTINCT FROM OLD.raw_input
		OR NEW.interpretation IS DISTINCT FROM OLD.interpretation
		OR NEW.module_writes IS DISTINCT FROM OLD.module_writes
		OR NEW.response_text IS DISTINCT FROM OLD.response_text
		OR NEW.audio_ref IS DISTINCT FROM OLD.audio_ref
		OR NEW.sensitivity IS DISTINCT FROM OLD.sensitivity
		OR NEW.search_norm IS DISTINCT FROM OLD.search_norm
		OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
		RAISE EXCEPTION 'ledger_entries icerik immutable (yalniz superseded_by degisebilir)';
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER "ledger_no_delete" BEFORE DELETE ON "ledger_entries" FOR EACH ROW EXECUTE FUNCTION ledger_append_only();
--> statement-breakpoint
CREATE TRIGGER "ledger_immutable" BEFORE UPDATE ON "ledger_entries" FOR EACH ROW EXECUTE FUNCTION ledger_append_only();
