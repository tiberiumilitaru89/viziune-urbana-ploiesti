const FORMULA_TRIGGER_REGEX = /^[=+\-@\t\r]/;
const IP_FORMAT_REGEX = /^[0-9a-fA-F:.]{2,64}$/;
const CNP_PATTERN = /\b[1-8]\d{12}\b/g;

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
 * Extracts client IP resisting left-edge X-Forwarded-For spoofing.
 */
export function extractTrustedClientIp(req: Request): string {
  const cfIp = normalizeValidIp(req.headers.get("cf-connecting-ip"));
  if (cfIp) return cfIp;

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

function resolveRequestHost(req: Request): string {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim().toLowerCase();
  if (forwardedHost) return forwardedHost;

  const hostHeader = req.headers.get("host")?.trim().toLowerCase();
  if (hostHeader) return hostHeader;

  try {
    return new URL(req.url).host.toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Validates Origin, Referer, and Sec-Fetch-Site headers on mutating requests against the active host.
 */
export function verifySameOriginRequest(req: Request): { allowed: boolean; reason?: string } {
  const fetchSite = req.headers.get("sec-fetch-site")?.trim().toLowerCase();
  if (fetchSite === "cross-site") {
    return { allowed: false, reason: "Cross-site fetch rejected" };
  }

  const expectedHost = resolveRequestHost(req);
  const origin = req.headers.get("origin")?.trim();

  if (origin) {
    if (origin === "null") {
      return { allowed: false, reason: "Opaque origin rejected" };
    }
    try {
      const originHost = new URL(origin).host.toLowerCase();
      if (!expectedHost || originHost !== expectedHost) {
        return { allowed: false, reason: "Origin host mismatch" };
      }
    } catch {
      return { allowed: false, reason: "Malformed origin header" };
    }
    return { allowed: true };
  }

  const referer = req.headers.get("referer")?.trim();
  if (referer) {
    try {
      const refererHost = new URL(referer).host.toLowerCase();
      if (!expectedHost || refererHost !== expectedHost) {
        return { allowed: false, reason: "Referer host mismatch" };
      }
    } catch {
      return { allowed: false, reason: "Malformed referer header" };
    }
  }

  return { allowed: true };
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

  const totalLength = chunks.reduce((acc, part) => acc + part.length, 0);
  const sanitized = new Uint8Array(totalLength);
  let writeOffset = 0;
  for (const part of chunks) {
    sanitized.set(part, writeOffset);
    writeOffset += part.length;
  }
  return sanitized;
}
