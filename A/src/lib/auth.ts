import "server-only";
import crypto from "crypto";
import { logStructured } from "./logger";

export const LEGACY_SESSION_COOKIE_NAME = "vup_admin_session";
export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-vup_admin_session"
    : LEGACY_SESSION_COOKIE_NAME;
export const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 ore
export const SESSION_DURATION_MS = SESSION_DURATION_SECONDS * 1000;

const MAX_REVOKED_NONCES = 5_000;
const MIN_PRODUCTION_SECRET_LEN = 32;
const MAX_PASSWORD_BYTES = 128;

// Registru local în memorie al sesiunilor revocate (dublat distribuit în Upstash/Vercel KV când e configurat)
const revokedNonces = new Map<string, number>();

function getKvConfig(): { kvUrl: string; kvToken: string } | null {
  const kvUrl = (
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    ""
  ).trim();
  const kvToken = (
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    ""
  ).trim();
  if (!kvUrl || !kvToken) return null;
  return { kvUrl: kvUrl.replace(/\/$/, ""), kvToken };
}

function getSecretKey(): string {
  const adminSecret = process.env.ADMIN_SECRET?.trim();
  if (adminSecret && adminSecret.length >= MIN_PRODUCTION_SECRET_LEN) {
    return crypto
      .createHmac("sha256", "vup-admin-session-signing-v1")
      .update(adminSecret)
      .digest("hex");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "EROARE CRITICĂ DE SECURITATE: Variabila ADMIN_SECRET lipsește sau are sub 32 caractere în producție."
    );
  }

  if (adminSecret && adminSecret.length > 0) {
    return crypto
      .createHmac("sha256", "vup-admin-session-signing-v1")
      .update(adminSecret)
      .digest("hex");
  }

  // În mediul local/test fără ADMIN_SECRET, derivăm determinist prin HMAC-SHA256 cu salt de domeniu separat
  const testSeed = process.env.COMPUTERNAME || "vup-local-test";
  return crypto
    .createHmac("sha256", "vup-dev-test-domain-salt-v1")
    .update(testSeed)
    .digest("hex");
}

type SessionPayload = {
  role: "admin";
  exp: number;
  nonce: string;
};

function hashNonce(nonce: string): string {
  return crypto.createHash("sha256").update(nonce).digest("hex");
}

function addLocalRevokedNonce(nonceHash: string, expMs: number): void {
  const now = Date.now();
  if (!revokedNonces.has(nonceHash) && revokedNonces.size >= MAX_REVOKED_NONCES) {
    for (const [k, exp] of revokedNonces.entries()) {
      if (now > exp) {
        revokedNonces.delete(k);
      }
    }
    while (revokedNonces.size >= MAX_REVOKED_NONCES) {
      const oldestKey = revokedNonces.keys().next().value;
      if (oldestKey === undefined) break;
      revokedNonces.delete(oldestKey);
    }
  }
  revokedNonces.set(nonceHash, expMs);
}

function isLocallyRevoked(nonceHash: string): boolean {
  const expMs = revokedNonces.get(nonceHash);
  if (expMs === undefined) return false;
  if (Date.now() > expMs) {
    revokedNonces.delete(nonceHash);
    return false;
  }
  return true;
}

function parseVerifiedSessionPayload(token: string | null | undefined): SessionPayload | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, providedSig] = parts;
  const secret = getSecretKey();

  try {
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    const providedBuf = Buffer.from(providedSig);
    const expectedBuf = Buffer.from(expectedSig);

    if (providedBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) return null;

    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const parsed = JSON.parse(payloadJson) as unknown;

    if (!parsed || typeof parsed !== "object") return null;
    const session = parsed as Partial<SessionPayload>;

    if (
      session.role !== "admin" ||
      typeof session.exp !== "number" ||
      typeof session.nonce !== "string" ||
      session.nonce.length < 16
    ) {
      return null;
    }
    if (Date.now() > session.exp) return null;

    return session as SessionPayload;
  } catch {
    return null;
  }
}

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
 * Validează semnătura, expirarea și lista locală de revocare a token-ului de sesiune
 */
export function verifySessionToken(token: string | null | undefined): boolean {
  const session = parseVerifiedSessionPayload(token);
  if (!session) return false;
  return !isLocallyRevoked(hashNonce(session.nonce));
}

/**
 * Revocă server-side token-ul curent (local + distribuit în KV/Upstash dacă este configurat)
 */
export async function revokeSessionToken(token: string | null | undefined): Promise<void> {
  const session = parseVerifiedSessionPayload(token);
  if (!session) return;

  const nonceHash = hashNonce(session.nonce);
  addLocalRevokedNonce(nonceHash, session.exp);

  const kv = getKvConfig();
  if (!kv) return;

  const remainingSeconds = Math.max(1, Math.ceil((session.exp - Date.now()) / 1000));
  try {
    await fetch(`${kv.kvUrl}/pipeline`, {
      method: "POST",
      signal: AbortSignal.timeout(1500),
      headers: {
        Authorization: `Bearer ${kv.kvToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["SET", `vup:revoked:${nonceHash}`, "1", "EX", remainingSeconds],
      ]),
    });
  } catch {
    logStructured("warn", "admin_session_kv_revoke_failed");
  }
}

export async function isSessionTokenRevokedAsync(token: string | null | undefined): Promise<boolean> {
  const session = parseVerifiedSessionPayload(token);
  if (!session) return true;

  const nonceHash = hashNonce(session.nonce);
  if (isLocallyRevoked(nonceHash)) return true;

  const kv = getKvConfig();
  if (!kv) return false;

  try {
    const res = await fetch(`${kv.kvUrl}/pipeline`, {
      method: "POST",
      signal: AbortSignal.timeout(1500),
      headers: {
        Authorization: `Bearer ${kv.kvToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([["GET", `vup:revoked:${nonceHash}`]]),
    });
    if (res.ok) {
      const data = (await res.json()) as Array<{ result?: string | null }>;
      if (data?.[0]?.result === "1") {
        addLocalRevokedNonce(nonceHash, session.exp);
        return true;
      }
    }
  } catch {
    // Graceful fallback la revocarea locală dacă KV nu răspunde
  }

  return false;
}

/**
 * Extrage token-ul de sesiune exclusiv din cookie-ul securizat HTTP-only
 */
export function extractSessionTokenFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const prefix = `${SESSION_COOKIE_NAME}=`;
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(prefix)) {
      const token = cookie.substring(prefix.length).trim();
      if (token) return token;
    }
  }

  return null;
}

/**
 * Verifică sesiunea curentă a cererii HTTP exclusiv din cookie-ul de sesiune (sincron)
 */
export function isRequestAuthenticated(req: Request): boolean {
  const token = extractSessionTokenFromRequest(req);
  return verifySessionToken(token);
}

/**
 * Verifică sesiunea curentă a cererii HTTP inclusiv revocarea distribuită în KV
 */
export async function isRequestAuthenticatedAsync(req: Request): Promise<boolean> {
  const token = extractSessionTokenFromRequest(req);
  if (!verifySessionToken(token)) return false;
  return !(await isSessionTokenRevokedAsync(token));
}

function verifyScryptPassword(cleanInput: string, encodedHash: string): boolean {
  const parts = encodedHash.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, saltHex, hashHex] = parts;
  if (
    !saltHex ||
    !hashHex ||
    !/^[0-9a-fA-F]+$/.test(saltHex) ||
    !/^[0-9a-fA-F]+$/.test(hashHex) ||
    saltHex.length < 32 ||
    hashHex.length < 64 ||
    saltHex.length % 2 !== 0 ||
    hashHex.length % 2 !== 0
  ) {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const expectedBuf = Buffer.from(hashHex, "hex");
  const derived = crypto.scryptSync(cleanInput, salt, expectedBuf.length, {
    N: 16384,
    r: 8,
    p: 1,
  });

  if (derived.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(derived, expectedBuf);
}

/**
 * Verifică parola transmisă împotriva ADMIN_PASSWORD_SCRYPT_HASH sau ADMIN_PASSWORD.
 * Fail-Fast și comparare în timp constant cu cap anti-DoS de 128 octeți.
 */
export function verifyAdminPassword(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  if (Buffer.byteLength(input, "utf8") > MAX_PASSWORD_BYTES) return false;

  const cleanInput = input.trim();
  if (!cleanInput) return false;

  const scryptHash = process.env.ADMIN_PASSWORD_SCRYPT_HASH?.trim();
  if (scryptHash) {
    return verifyScryptPassword(cleanInput, scryptHash);
  }

  const configuredPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!configuredPassword) {
    logStructured("error", "admin_auth_missing_password_env");
    return false;
  }

  const hashInput = crypto.createHash("sha256").update(cleanInput).digest();
  const hashExpected = crypto.createHash("sha256").update(configuredPassword).digest();

  return crypto.timingSafeEqual(hashInput, hashExpected);
}
