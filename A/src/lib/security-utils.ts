const FORMULA_TRIGGER_REGEX = /^[=+\-@\t\r]/;
const IP_FORMAT_REGEX = /^[0-9a-fA-F:.]{2,64}$/;
const CNP_PATTERN = /\b[1-8]\d{12}\b/g;
const PNG_DATA_URL_PREFIX = "data:image/png;base64,";
const PNG_BASE64_BODY_REGEX = /^[A-Za-z0-9+/]+=*$/;
const SAFE_STORAGE_KEY_REGEX = /^[A-Za-z0-9._-]+$/;
const ALLOWED_STORAGE_BUCKETS = new Set(["proiecte", "Proiecte"]);
const CANONICAL_ALLOWED_HOSTS = [
  "www.viziuneurbanaploiesti.ro",
  "viziuneurbanaploiesti.ro",
];
const PNG_STRIPPED_CHUNKS = new Set(["eXIf", "tEXt", "zTXt", "iTXt", "tIME"]);
const MAX_SIGNATURE_DATA_URL_LENGTH = 350_000;
const MIN_SIGNATURE_DATA_URL_LENGTH = 100;

/**
 * Redacts PII fields (CNP, phone, email, address, signature, secrets, tokens, cookies, stack) from structured logs.
 */
export function sanitizeLogValue(val: unknown): unknown {
  if (typeof val === "string") {
    return val.replace(CNP_PATTERN, "[REDACTED_CNP]");
  }
  if (val instanceof Error) {
    return {
      name: val.name,
      message: val.message.replace(CNP_PATTERN, "[REDACTED_CNP]"),
    };
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeLogValue);
  }
  if (val && typeof val === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      const lower = k.toLowerCase();
      if (
        lower === "cnp" ||
        lower.includes("password") ||
        lower.includes("secret") ||
        lower.includes("token") ||
        lower.includes("signature") ||
        lower.includes("semnatura") ||
        lower === "phone" ||
        lower === "telefon" ||
        lower === "donor_phone" ||
        lower === "email" ||
        lower === "donor_email" ||
        lower === "address" ||
        lower === "adresa" ||
        lower === "authorization" ||
        lower === "cookie" ||
        lower === "stack"
      ) {
        out[k] = "[REDACTED]";
      } else {
        out[k] = sanitizeLogValue(v);
      }
    }
    return out;
  }
  return val;
}

/**
 * Escapes and neutralizes spreadsheet formula payloads (CWE-1236) for RFC 4180 CSV exports.
 */
export function sanitizeCsvCell(val: string | number | undefined | null): string {
  const str = String(val ?? "");
  const neutralized = FORMULA_TRIGGER_REGEX.test(str) ? `'${str}` : str;
  if (
    neutralized.includes(",") ||
    neutralized.includes('"') ||
    neutralized.includes("\n") ||
    neutralized.includes("\r") ||
    neutralized.includes(";")
  ) {
    return `"${neutralized.replace(/"/g, '""')}"`;
  }
  return neutralized;
}

function normalizeValidIp(candidate: string | null | undefined): string | null {
  if (!candidate) return null;
  const trimmed = candidate.trim();
  return IP_FORMAT_REGEX.test(trimmed) ? trimmed : null;
}

/**
 * Extracts client IP aligned to Vercel edge proxy precedence; trusts cf-connecting-ip only when Cloudflare proxy is explicitly enabled.
 */
export function extractTrustedClientIp(req: Request): string {
  if (process.env.TRUST_CLOUDFLARE_PROXY === "true") {
    const cfIp = normalizeValidIp(req.headers.get("cf-connecting-ip"));
    if (cfIp) return cfIp;
  }

  const vercelFwd = req.headers.get("x-vercel-forwarded-for");
  if (vercelFwd) {
    const parts = vercelFwd.split(",");
    for (let i = parts.length - 1; i >= 0; i--) {
      const valid = normalizeValidIp(parts[i]);
      if (valid) return valid;
    }
  }

  const realIp = normalizeValidIp(req.headers.get("x-real-ip"));
  if (realIp) return realIp;

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",");
    for (let i = parts.length - 1; i >= 0; i--) {
      const valid = normalizeValidIp(parts[i]);
      if (valid) return valid;
    }
  }

  return "127.0.0.1";
}

function getAllowedHosts(): Set<string> {
  const allowed = new Set<string>(CANONICAL_ALLOWED_HOSTS);

  for (const envUrl of [process.env.APP_BASE_URL, process.env.NEXT_PUBLIC_SITE_URL]) {
    if (!envUrl) continue;
    try {
      const parsedHost = new URL(envUrl.trim()).host.toLowerCase();
      if (parsedHost) allowed.add(parsedHost);
    } catch {
      // Ignore malformed env URL
    }
  }

  if (process.env.NODE_ENV !== "production") {
    allowed.add("localhost:3000");
    allowed.add("localhost:3005");
    allowed.add("127.0.0.1:3000");
    allowed.add("127.0.0.1:3005");
  }

  return allowed;
}

/**
 * Fail-closed Same-Origin verification using Sec-Fetch-Site, Origin/Referer, and canonical host allowlist.
 */
export function verifySameOriginRequest(req: Request): { allowed: boolean; reason?: string } {
  const fetchSite = req.headers.get("sec-fetch-site")?.trim().toLowerCase();
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return { allowed: false, reason: "Cross-site or cross-origin fetch rejected" };
  }

  const origin = req.headers.get("origin")?.trim();
  const referer = req.headers.get("referer")?.trim();

  if (!origin && !referer) {
    return { allowed: false, reason: "Missing Origin and Referer headers" };
  }

  const allowedHosts = getAllowedHosts();
  const candidate = origin || referer || "";
  if (candidate === "null") {
    return { allowed: false, reason: "Opaque origin rejected" };
  }

  try {
    const candidateHost = new URL(candidate).host.toLowerCase();
    if (!allowedHosts.has(candidateHost)) {
      return { allowed: false, reason: "Origin host not in canonical allowlist" };
    }
    return { allowed: true };
  } catch {
    return { allowed: false, reason: "Malformed origin or referer header" };
  }
}

/**
 * Strictly validates that handwritten signatures are bounded PNG base64 data URLs with genuine PNG/IHDR magic bytes.
 */
export function isValidPngSignatureDataUrl(value: string): boolean {
  if (
    typeof value !== "string" ||
    value.length < MIN_SIGNATURE_DATA_URL_LENGTH ||
    value.length > MAX_SIGNATURE_DATA_URL_LENGTH
  ) {
    return false;
  }

  if (!value.startsWith(PNG_DATA_URL_PREFIX)) {
    return false;
  }

  const b64 = value.slice(PNG_DATA_URL_PREFIX.length);
  if (!b64 || !PNG_BASE64_BODY_REGEX.test(b64)) {
    return false;
  }

  const bytes = Buffer.from(b64, "base64");
  if (bytes.length < 24) {
    return false;
  }

  const hasPngSig =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;

  const hasIhdr =
    bytes[12] === 0x49 &&
    bytes[13] === 0x48 &&
    bytes[14] === 0x44 &&
    bytes[15] === 0x52;

  return hasPngSig && hasIhdr;
}

/**
 * Parses and restricts Supabase Storage public URLs to the configured project origin, allowed bucket, and flat file key.
 */
export function parseAllowedStorageTarget(
  fileUrl: string,
  supabaseBaseUrl: string
): { bucket: string; filePath: string } | null {
  if (!fileUrl || !supabaseBaseUrl) return null;

  let parsed: URL;
  let base: URL;
  try {
    parsed = new URL(fileUrl);
    base = new URL(supabaseBaseUrl);
  } catch {
    return null;
  }

  if (parsed.origin !== base.origin) {
    return null;
  }

  const prefix = "/storage/v1/object/public/";
  if (!parsed.pathname.startsWith(prefix)) {
    return null;
  }

  const rest = parsed.pathname.slice(prefix.length);
  const slashIdx = rest.indexOf("/");
  if (slashIdx <= 0) {
    return null;
  }

  const bucket = rest.slice(0, slashIdx);
  if (!ALLOWED_STORAGE_BUCKETS.has(bucket)) {
    return null;
  }

  let filePath: string;
  try {
    filePath = decodeURIComponent(rest.slice(slashIdx + 1));
  } catch {
    return null;
  }

  if (
    !filePath ||
    filePath.includes("/") ||
    filePath.includes("\\") ||
    filePath.includes("..") ||
    filePath.includes("\0") ||
    !SAFE_STORAGE_KEY_REGEX.test(filePath)
  ) {
    return null;
  }

  return { bucket, filePath };
}

/**
 * Validates media or external link URLs against safe protocols (internal relative paths or HTTPS URLs).
 */
export function validateSafeMediaOrLinkUrl(
  value: string,
  options?: { allowRelative?: boolean }
): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  if (/^\/(?!\/|\\)/.test(trimmed)) {
    return options?.allowRelative !== false;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:") {
      return true;
    }
    if (
      process.env.NODE_ENV !== "production" &&
      parsed.protocol === "http:" &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function normalizeDonationStatus(
  raw: unknown
): "inregistrat" | "confirmat" | "finalizat" | "arhivat" {
  if (
    raw === "confirmat" ||
    raw === "finalizat" ||
    raw === "arhivat" ||
    raw === "inregistrat"
  ) {
    return raw;
  }
  return "inregistrat";
}

function concatChunks(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((acc, part) => acc + part.length, 0);
  const out = new Uint8Array(totalLength);
  let writeOffset = 0;
  for (const part of chunks) {
    out.set(part, writeOffset);
    writeOffset += part.length;
  }
  return out;
}

/**
 * Strips EXIF/GPS (APP1), IPTC (APP13), and comment (COM) metadata segments from JPEG streams
 * prior to persisting uploads, keeping entropy-coded scan data untouched.
 */
export function stripJpegMetadata(bytes: Uint8Array): Uint8Array {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return bytes;
  }

  const chunks: Uint8Array[] = [bytes.slice(0, 2)];
  let offset = 2;

  while (offset + 1 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      chunks.push(bytes.slice(offset));
      break;
    }

    while (offset < bytes.length && bytes[offset] === 0xff) {
      offset++;
    }
    if (offset >= bytes.length) break;

    const marker = bytes[offset];
    offset++;

    if (marker === 0xda || marker === 0xd9) {
      chunks.push(new Uint8Array([0xff, marker]));
      if (offset < bytes.length) {
        chunks.push(bytes.slice(offset));
      }
      break;
    }

    if (marker === 0x00 || (marker >= 0xd0 && marker <= 0xd8)) {
      chunks.push(new Uint8Array([0xff, marker]));
      continue;
    }

    if (offset + 1 >= bytes.length) {
      break;
    }

    const segmentLength = (bytes[offset] << 8) | bytes[offset + 1];
    if (segmentLength < 2 || offset + segmentLength > bytes.length) {
      chunks.push(new Uint8Array([0xff, marker]), bytes.slice(offset));
      break;
    }

    const shouldStrip = marker === 0xe1 || marker === 0xed || marker === 0xfe;
    if (!shouldStrip) {
      chunks.push(new Uint8Array([0xff, marker]), bytes.slice(offset, offset + segmentLength));
    }

    offset += segmentLength;
  }

  return concatChunks(chunks);
}

/**
 * Strips metadata chunks (eXIf, tEXt, zTXt, iTXt, tIME) from PNG streams while keeping image chunks intact.
 */
export function stripPngMetadata(bytes: Uint8Array): Uint8Array {
  if (
    bytes.length < 8 ||
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47 ||
    bytes[4] !== 0x0d ||
    bytes[5] !== 0x0a ||
    bytes[6] !== 0x1a ||
    bytes[7] !== 0x0a
  ) {
    return bytes;
  }

  const chunks: Uint8Array[] = [bytes.slice(0, 8)];
  let offset = 8;

  while (offset < bytes.length) {
    if (offset + 12 > bytes.length) {
      chunks.push(bytes.slice(offset));
      break;
    }

    const len =
      ((bytes[offset] << 24) |
        (bytes[offset + 1] << 16) |
        (bytes[offset + 2] << 8) |
        bytes[offset + 3]) >>>
      0;

    if (len > bytes.length - offset - 12) {
      chunks.push(bytes.slice(offset));
      break;
    }

    const chunkType = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7]
    );

    const chunkEnd = offset + 12 + len;
    if (!PNG_STRIPPED_CHUNKS.has(chunkType)) {
      chunks.push(bytes.slice(offset, chunkEnd));
    }
    offset = chunkEnd;
  }

  return concatChunks(chunks);
}

/**
 * Strips EXIF and XMP metadata sub-chunks from WebP RIFF containers and updates VP8X flags & RIFF size.
 */
export function stripWebpMetadata(bytes: Uint8Array): Uint8Array {
  if (bytes.length < 12) {
    return bytes;
  }

  const isRiff =
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
  const isWebp =
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;

  if (!isRiff || !isWebp) {
    return bytes;
  }

  const chunks: Uint8Array[] = [bytes.slice(0, 12)];
  let offset = 12;

  while (offset + 8 <= bytes.length) {
    const chunkId = String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3]
    );
    const chunkSize =
      (bytes[offset + 4] |
        (bytes[offset + 5] << 8) |
        (bytes[offset + 6] << 16) |
        (bytes[offset + 7] << 24)) >>>
      0;

    if (chunkSize > bytes.length - offset - 8) {
      chunks.push(bytes.slice(offset));
      break;
    }

    const paddedSize = chunkSize + (chunkSize % 2);
    const chunkEnd = Math.min(bytes.length, offset + 8 + paddedSize);

    if (chunkId !== "EXIF" && chunkId !== "XMP ") {
      const part = bytes.slice(offset, chunkEnd);
      if (chunkId === "VP8X" && chunkSize >= 10 && part.length > 8) {
        part[8] = part[8] & ~(0x08 | 0x04);
      }
      chunks.push(part);
    }

    offset = chunkEnd;
  }

  const sanitized = concatChunks(chunks);
  if (sanitized.length >= 12) {
    const riffSize = sanitized.length - 8;
    sanitized[4] = riffSize & 0xff;
    sanitized[5] = (riffSize >>> 8) & 0xff;
    sanitized[6] = (riffSize >>> 16) & 0xff;
    sanitized[7] = (riffSize >>> 24) & 0xff;
  }

  return sanitized;
}

export function stripImageMetadata(bytes: Uint8Array, mimeType: string): Uint8Array {
  if (mimeType === "image/jpeg") return stripJpegMetadata(bytes);
  if (mimeType === "image/png") return stripPngMetadata(bytes);
  if (mimeType === "image/webp") return stripWebpMetadata(bytes);
  return bytes;
}
