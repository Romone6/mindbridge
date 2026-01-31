import crypto from "crypto";

const COOKIE_NAME = "mb_portal_access";
const TOKEN_PREFIX = "v1";

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

function getPortalSecret() {
  return process.env.PORTAL_ACCESS_SECRET || process.env.BETTER_AUTH_SECRET || "";
}

export function createPortalAccessToken({
  ttlSeconds,
}: {
  ttlSeconds: number;
}) {
  const secret = getPortalSecret();
  if (!secret) {
    throw new Error(
      "Portal access secret is missing. Set PORTAL_ACCESS_SECRET (or BETTER_AUTH_SECRET)."
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + ttlSeconds,
  };

  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const mac = crypto
    .createHmac("sha256", secret)
    .update(`${TOKEN_PREFIX}.${payloadB64}`)
    .digest();
  const sigB64 = base64UrlEncode(mac);
  return `${TOKEN_PREFIX}.${payloadB64}.${sigB64}`;
}

export function verifyPortalAccessToken(token: string | undefined | null) {
  if (!token) return false;
  const secret = getPortalSecret();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [prefix, payloadB64, sigB64] = parts;
  if (prefix !== TOKEN_PREFIX) return false;

  const expectedSig = base64UrlEncode(
    crypto
      .createHmac("sha256", secret)
      .update(`${TOKEN_PREFIX}.${payloadB64}`)
      .digest()
  );

  if (!timingSafeEqual(expectedSig, sigB64)) return false;

  try {
    const payloadJson = base64UrlDecodeToString(payloadB64);
    const payload = JSON.parse(payloadJson) as { exp?: number };
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || now >= payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export function getPortalAccessCookieName() {
  return COOKIE_NAME;
}

export function isPortalAccessConfigured() {
  if (process.env.NODE_ENV !== "production") return true;
  if (process.env.PORTAL_ACCESS_CODE) return true;
  // Allow allowlist-based access as long as the server can query Supabase.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return true;
  return false;
}

export function isValidPortalAccessCode(input: string) {
  const configured = process.env.PORTAL_ACCESS_CODE;
  if (!configured) {
    return process.env.NODE_ENV !== "production";
  }

  const provided = input.trim();
  const allowed = configured
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  return allowed.some((c) => timingSafeEqual(c, provided));
}
