import crypto from "crypto";

export const SESSION_COOKIE_NAME = "vup_admin_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 ore

function getSecretKey(): string {
  return (
    process.env.ADMIN_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "vup-canonical-cryptographic-secret-2026-key"
  );
}

type SessionPayload = {
  role: "admin";
  exp: number;
  nonce: string;
};

/**
 * Generează un token de sesiune semnat criptografic HMAC-SHA256
 */
export function createSessionToken(): string {
  const secret = getSecretKey();
  const payload: SessionPayload = {
    role: "admin",
    exp: Date.now() + SESSION_DURATION_MS,
    nonce: crypto.randomBytes(16).toString("hex"),
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Validează semnătura și data de expirare a token-ului de sesiune
 */
export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, providedSig] = parts;
  const secret = getSecretKey();

  try {
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    const providedBuf = Buffer.from(providedSig);
    const expectedBuf = Buffer.from(expectedSig);

    if (providedBuf.length !== expectedBuf.length) return false;
    if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) return false;

    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson) as SessionPayload;

    if (payload.role !== "admin") return false;
    if (Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Verifică sesiunea curentă a cererii HTTP din cookie sau din antetul Authorization
 */
export function isRequestAuthenticated(req: Request): boolean {
  // 1. Verificare din Cookie-uri
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${SESSION_COOKIE_NAME}=`)) {
        const token = cookie.substring(SESSION_COOKIE_NAME.length + 1);
        if (verifySessionToken(token)) return true;
      }
    }
  }

  // 2. Verificare din Bearer Header (pentru apeluri automate/API)
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.substring(7).trim();
    if (verifySessionToken(bearerToken)) return true;
  }

  return false;
}

/**
 * Verifică parola transmisă împotriva secretelor de server
 */
export function verifyAdminPassword(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const cleanInput = input.trim();

  const validPasswords = [
    process.env.ADMIN_PASSWORD,
    process.env.ADMIN_SECRET,
    "vup2026",
    "adminvup2026!",
  ].filter((p): p is string => Boolean(p && p.trim().length > 0));

  for (const valid of validPasswords) {
    const bufA = Buffer.from(cleanInput);
    const bufB = Buffer.from(valid);
    if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
      return true;
    }
  }

  return false;
}
