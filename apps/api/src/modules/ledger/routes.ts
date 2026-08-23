import { Hono } from "hono";
import { noteInputSchema } from "@hayatos/shared";
import { readSession } from "../../auth/session.js";
import { writeLedger, search, exportRange } from "./service.js";

export const ledger = new Hono();

ledger.use("*", async (c, next) => {
  if (!(await readSession(c))) {
    return c.json({ error: "unauthorized", message: "Once giris yapmalisin." }, 401);
  }
  await next();
});

// Liste/arama: ?q&from&to&channel&cursor&limit
ledger.get("/", async (c) => {
  const q = c.req.query();
  const page = await search({
    q: q.q,
    channel: q.channel,
    cursor: q.cursor,
    limit: q.limit ? Number(q.limit) : undefined,
    from: q.from ? new Date(q.from) : undefined,
    to: q.to ? new Date(q.to) : undefined,
  });
  return c.json(page);
});

ledger.post("/note", async (c) => {
  const parsed = noteInputSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) return c.json({ error: "bad_request", message: "Not bos olamaz." }, 400);
  const { id } = await writeLedger({ channel: "text", actor: "user", raw_input: parsed.data.raw_input });
  return c.json({ ok: true, id });
});

ledger.get("/export", async (c) => {
  const q = c.req.query();
  const format = q.format === "json" ? "json" : "text";
  const { body, contentType, filename } = await exportRange({
    format,
    from: q.from ? new Date(q.from) : undefined,
    to: q.to ? new Date(q.to) : undefined,
  });
  c.header("Content-Type", contentType);
  c.header("Content-Disposition", `attachment; filename="${filename}"`);
  return c.body(body);
});
