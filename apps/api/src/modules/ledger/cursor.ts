// Cursor = base64url("<ISO ts>|<id>"). ts desc + id tie-break sayfalama.
export function encodeCursor(ts: Date, id: string): string {
  return Buffer.from(`${ts.toISOString()}|${id}`, "utf8").toString("base64url");
}

export function decodeCursor(c: string): { ts: Date; id: string } | null {
  try {
    const [iso, id] = Buffer.from(c, "base64url").toString("utf8").split("|");
    if (!iso || !id) return null;
    const ts = new Date(iso);
    if (Number.isNaN(ts.getTime())) return null;
    return { ts, id };
  } catch {
    return null;
  }
}
