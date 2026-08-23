import { describe, it, expect, beforeEach, vi } from "vitest";
import { truncateLedger } from "../../../test/db.js";

vi.mock("../../auth/session.js", () => ({ readSession: async () => ({ sub: "u1" }) }));
const { ledger } = await import("./routes.js");

describe("ledger routes", () => {
  beforeEach(truncateLedger);

  it("POST /note bos raw_input -> 400", async () => {
    const res = await ledger.request("/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_input: "   " }),
    });
    expect(res.status).toBe(400);
  });

  it("POST /note yazar, GET / listeler", async () => {
    const post = await ledger.request("/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_input: "ilk not" }),
    });
    expect(post.status).toBe(200);
    const list = await ledger.request("/");
    const json: any = await list.json();
    expect(json.rows.map((r: any) => r.rawInput)).toContain("ilk not");
  });

  it("GET /export text/plain indirir", async () => {
    const post = await ledger.request("/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_input: "aktif satir" }),
    });
    expect(post.status).toBe(200);
    const res = await ledger.request("/export?format=text");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    expect(res.headers.get("content-disposition")).toContain("defter-");
    expect(await res.text()).toContain("Sen: aktif satir");
  });

  it("GET / q aramasi calisir", async () => {
    await ledger.request("/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_input: "İstanbul notu" }),
    });
    await ledger.request("/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_input: "alakasiz kayit" }),
    });
    const res = await ledger.request(`/?q=${encodeURIComponent("istanbul")}`);
    const json: any = await res.json();
    expect(json.rows).toHaveLength(1);
    expect(json.rows[0].rawInput).toBe("İstanbul notu");
  });
});
