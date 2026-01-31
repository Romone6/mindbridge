import crypto from "crypto";

const COOKIE_NAME = "mb_demo_usage";
const TOKEN_PREFIX = "v1";

type Payload = {
  iat: number;
  exp: number;
  used: number;
};

function base64UrlEncode(input: Buffer | string) {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecodeToString(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLength);
  return Buffer.from(padded, "base64").toString("utf8");
}

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function getSecret() {
  return process.env.DEMO_USAGE_SECRET || process.env.BETTER_AUTH_SECRET || "";
}

function sign(payloadB64: string) {
  const secret = getSecret();
  if (!secret) {
    throw new Error(
      "Demo usage secret is missing. Set DEMO_USAGE_SECRET (or BETTER_AUTH_SECRET)."
    );
  }
  return base64UrlEncode(
    crypto
      .createHmac("sha256", secret)
      .update(`${TOKEN_PREFIX}.${payloadB64}`)
      .digest()
  );
}

export function getDemoUsageCookieName() {
  return COOKIE_NAME;
}

export function readDemoUsage(token: string | undefined | null) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [prefix, payloadB64, sigB64] = parts;
  if (prefix !== TOKEN_PREFIX) return null;
  try {
    const expectedSig = sign(payloadB64);
    if (!timingSafeEqual(expectedSig, sigB64)) return null;

    const payloadJson = base64UrlDecodeToString(payloadB64);
    const payload = JSON.parse(payloadJson) as Payload;
    if (!payload.exp || !payload.iat) return null;
    const now = Math.floor(Date.now() / 1000);
    if (now >= payload.exp) return null;
    if (typeof payload.used !== "number" || payload.used < 0) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createDemoUsageToken({
  ttlSeconds,
  used,
}: {
  ttlSeconds: number;
  used: number;
}) {
  const now = Math.floor(Date.now() / 1000);
  const payload: Payload = {
    iat: now,
    exp: now + ttlSeconds,
    used,
  };
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const sigB64 = sign(payloadB64);
  return `${TOKEN_PREFIX}.${payloadB64}.${sigB64}`;
}
