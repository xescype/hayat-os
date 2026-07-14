import { describe, it, expect } from "vitest";
import { seal, open } from "./box.js";

describe("crypto/box (secretbox)", () => {
  it("encrypt -> decrypt round-trip", async () => {
    const plain = new TextEncoder().encode("bench 62.5'e ciktim 8-8-7");
    const sealed = await seal(plain);
    expect(sealed.length).toBeGreaterThan(plain.length); // nonce + tag eklendi
    const opened = await open(sealed);
    expect(new TextDecoder().decode(opened)).toBe("bench 62.5'e ciktim 8-8-7");
  });

  it("ayni veri iki kez sifrelenince FARKLI cikti verir (rastgele IV), ikisi de cozulur", async () => {
    const plain = new TextEncoder().encode("ayni girdi");
    const a = await seal(plain);
    const b = await seal(plain);
    // Rastgele IV => ciphertext'ler ayni olmamali (GCM nonce tekrari yok kaniti).
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(false);
    // IV'ler (ilk 12 bayt) da farkli olmali.
    expect(Buffer.from(a.subarray(0, 12)).equals(Buffer.from(b.subarray(0, 12)))).toBe(false);
    // Yine de ikisi de dogru cozulur.
    expect(new TextDecoder().decode(await open(a))).toBe("ayni girdi");
    expect(new TextDecoder().decode(await open(b))).toBe("ayni girdi");
  });

  it("bozuk veri cozulemez", async () => {
    const sealed = await seal(new Uint8Array([1, 2, 3]));
    const bad = Uint8Array.from(sealed);
    const last = bad.length - 1;
    bad[last] = (bad[last] ?? 0) ^ 0xff; // son baytı boz
    await expect(open(bad)).rejects.toThrow();
  });
});
