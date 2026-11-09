import crypto from "node:crypto";

const ENCRYPTION_PREFIX = "enc:v1:";
const IV_LENGTH_BYTES = 12;
const AUTH_TAG_LENGTH_BYTES = 16;
const HKDF_SALT = "vup-pii-salt-v1-ploiesti";
const HKDF_INFO = "vup-formular230-aes-256-gcm-key";

let cachedRawSecret: string | null = null;
let cachedDerivedKey: Buffer | null = null;

/**
 * Derivă determinist o cheie de 32 octeți (256 biți) folosind HKDF-SHA256
 * din PII_ENCRYPTION_KEY sau ADMIN_SECRET.
 */
function getEncryptionKey(): Buffer {
  const rawSecret =
    process.env.PII_ENCRYPTION_KEY ||
    process.env.ADMIN_SECRET ||
    (process.env.NODE_ENV !== "production" ? "vup-dev-fallback-pii-key-not-for-prod" : "");

  if (!rawSecret || rawSecret.trim().length === 0) {
    throw new Error(
      "EROARE CRITICĂ DE SECURITATE: Cheia PII_ENCRYPTION_KEY (sau ADMIN_SECRET) lipsește din mediul de execuție."
    );
  }

  if (cachedRawSecret === rawSecret && cachedDerivedKey) {
    return cachedDerivedKey;
  }

  const derived = crypto.hkdfSync(
    "sha256",
    Buffer.from(rawSecret, "utf8"),
    Buffer.from(HKDF_SALT, "utf8"),
    Buffer.from(HKDF_INFO, "utf8"),
    32
  );

  cachedRawSecret = rawSecret;
  cachedDerivedKey = Buffer.from(derived);
  return cachedDerivedKey;
}

/**
 * Criptează o valoare PII (ex. CNP, semnătură olografă base64) cu AES-256-GCM.
 * Format ieșire: enc:v1:<iv_base64>:<tag_base64>:<ciphertext_base64>
 */
export function encryptPII(plaintext: string): string {
  if (!plaintext || typeof plaintext !== "string") {
    return plaintext;
  }

  // Evită dubla criptare dacă valoarea este deja criptată
  if (plaintext.startsWith(ENCRYPTION_PREFIX)) {
    return plaintext;
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv, {
    authTagLength: AUTH_TAG_LENGTH_BYTES,
  });

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${ENCRYPTION_PREFIX}${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

/**
 * Decriptează și autentifică (AuthTag) o valoare PII criptată cu AES-256-GCM.
 * Dacă valoarea nu începe cu `enc:v1:`, este returnată ca atare pentru compatibilitate
 * zero-downtime cu înregistrările istorice din baza de date.
 * Aruncă eroare criptografică dacă AuthTag-ul sau ciphertext-ul a fost alterat.
 */
export function decryptPII(value: string): string {
  if (!value || typeof value !== "string") {
    return value;
  }

  if (!value.startsWith(ENCRYPTION_PREFIX)) {
    return value;
  }

  const parts = value.split(":");
  if (parts.length !== 5 || parts[0] !== "enc" || parts[1] !== "v1") {
    throw new Error("Format payload criptat PII invalid.");
  }

  const [, , ivB64, tagB64, cipherB64] = parts;
  if (!ivB64 || !tagB64 || cipherB64 === undefined) {
    throw new Error("Componente criptografice PII lipsă.");
  }

  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(cipherB64, "base64");

  if (iv.length !== IV_LENGTH_BYTES) {
    throw new Error("Lungime IV invalidă pentru AES-256-GCM.");
  }
  if (authTag.length !== AUTH_TAG_LENGTH_BYTES) {
    throw new Error("Lungime AuthTag invalidă pentru AES-256-GCM.");
  }

  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv, {
    authTagLength: AUTH_TAG_LENGTH_BYTES,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}
