import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function secret(): string {
  return (
    process.env.CIRCLE_ACCESS_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "beiza-dev-circle-access"
  );
}

export function hashCircleToken(raw: string): string {
  return createHmac("sha256", secret()).update(raw).digest("hex");
}

export function generateCircleAccessToken(): { raw: string; hash: string; expiresAt: Date } {
  const raw = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  return { raw, hash: hashCircleToken(raw), expiresAt };
}

export function signCircleSessionToken(circleId: string, rawToken: string): string {
  const payload = Buffer.from(
    JSON.stringify({ circleId, t: rawToken, exp: Date.now() + TOKEN_TTL_MS }),
  ).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyCircleSessionToken(
  token: string,
  expectedCircleId: string,
): { valid: boolean; rawToken?: string } {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return { valid: false };

  const expectedSig = createHmac("sha256", secret()).update(payload).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return { valid: false };
  } catch {
    return { valid: false };
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      circleId?: string;
      t?: string;
      exp?: number;
    };
    if (data.circleId !== expectedCircleId) return { valid: false };
    if (!data.t || !data.exp || data.exp < Date.now()) return { valid: false };
    return { valid: true, rawToken: data.t };
  } catch {
    return { valid: false };
  }
}
