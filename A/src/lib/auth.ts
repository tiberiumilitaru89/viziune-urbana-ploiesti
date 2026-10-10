import crypto from "crypto";

export const SESSION_COOKIE_NAME = "vup_admin_session";
export const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 ore
export const SESSION_DURATION_MS = SESSION_DURATION_SECONDS * 1000;

function getSecretKey(): string {
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("EROARE CRITICĂ DE SECURITATE: Variabila ADMIN_PASSWORD lipsește din mediu.");
    }
    // Fail-safe determinist doar în modul local de test
    return "local-dev-ephemeral-key-" + (process.env.COMPUTERNAME || "dev");
  }
  return secret;
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
    const parsed = JSON.parse(payloadJson) as unknown;

    if (!parsed || typeof parsed !== "object") return false;
    const session = parsed as Partial<SessionPayload>;

    if (session.role !== "admin" || typeof session.exp !== "number") return false;
    if (Date.now() > session.exp) return false;

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
 * Verifică parola transmisă împotriva variabilei de mediu ADMIN_PASSWORD
 * Fail-Fast: Respinge orice autentificare dacă ADMIN_PASSWORD nu este configurat.
 * Comparare în timp constant (SHA-256 digest) pentru a preveni atacurile timing-attack.
 */
export function verifyAdminPassword(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const configuredPassword = process.env.ADMIN_PASSWORD;

  // Zero-Tolerance: Fără parolă în env, accesul este matematic imposibil
  if (!configuredPassword || configuredPassword.trim().length === 0) {
    console.error("[CRITICAL SECURITY ALERT] Autentificare respinsă: ADMIN_PASSWORD nu este setată în environment.");
    return false;
  }

  const cleanInput = input.trim();

  // Hash-uim ambele valori pentru a garanta buffere de lungime identică (32 bytes) pentru timingSafeEqual
  const hashInput = crypto.createHash("sha256").update(cleanInput).digest();
  const hashExpected = crypto.createHash("sha256").update(configuredPassword.trim()).digest();

  return crypto.timingSafeEqual(hashInput, hashExpected);
}
