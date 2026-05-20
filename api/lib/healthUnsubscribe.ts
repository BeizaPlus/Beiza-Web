import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  const s =
    process.env.HEALTH_UNSUBSCRIBE_SECRET ??
    process.env.CIRCLE_ACCESS_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error("HEALTH_UNSUBSCRIBE_SECRET or CIRCLE_ACCESS_SECRET required");
  return s;
}

export function signHealthUnsubscribe(email: string, circleId: string) {
  const payload = `${email.toLowerCase().trim()}|${circleId}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return Buffer.from(`${payload}|${sig}`).toString("base64url");
}

export function verifyHealthUnsubscribe(token: string): { email: string; circleId: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split("|");
    if (parts.length !== 3) return null;
    const [email, circleId, sig] = parts;
    const payload = `${email}|${circleId}`;
    const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return { email, circleId };
  } catch {
    return null;
  }
}
