import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sitemap from "../src/app/sitemap.ts";
import { encryptPII, decryptPII } from "../src/lib/pii-crypto.ts";
import { escapeHtml, sanitizeHeader } from "../src/lib/email.ts";
import {
  createSessionToken,
  extractSessionTokenFromRequest,
  isRequestAuthenticatedAsync,
  isSessionTokenRevokedAsync,
  revokeSessionToken,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "../src/lib/auth.ts";
import {
  extractTrustedClientIp,
  isValidPngSignatureDataUrl,
  normalizeDonationStatus,
  parseAllowedStorageTarget,
  sanitizeCsvCell,
  sanitizeLogValue,
  stripJpegMetadata,
  stripPngMetadata,
  stripWebpMetadata,
  validateSafeMediaOrLinkUrl,
  verifySameOriginRequest,
} from "../src/lib/security-utils.ts";
import {
  InvalidJsonBodyError,
  PayloadTooLargeError,
  readJsonWithLimit,
} from "../src/lib/request-guard.ts";
import { validateRomanianCnp } from "../src/lib/cnp.ts";
import {
  filterPublicAssociations,
  mapAndDecryptFormular230Rows,
} from "../src/lib/db.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function buildPngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function buildSamplePngDataUrl(extraPaddingBytes = 40) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(120, 0);
  ihdrData.writeUInt32BE(60, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  const idatData = Buffer.alloc(extraPaddingBytes, 0xaa);
  const full = Buffer.concat([
    sig,
    buildPngChunk("IHDR", ihdrData),
    buildPngChunk("IDAT", idatData),
    buildPngChunk("IEND", Buffer.alloc(0)),
  ]);
  return `data:image/png;base64,${full.toString("base64")}`;
}

test("[VUP-SEC-001] AES-256-GCM PII Encryption & Decryption (CNP & Signature)", () => {
  process.env.PII_ENCRYPTION_KEY =
    "3e7a1c5f9b2d4e8a6c0f2b4d6e8a0c2f4b6d8e0a2c4f6b8d0e2a4c6f8b0d2e4a";

  const sampleCnp = "1890101290016";
  const encrypted1 = encryptPII(sampleCnp);
  const encrypted2 = encryptPII(sampleCnp);

  assert.equal(encrypted1.startsWith("enc:v1:"), true, "Ciphertext must start with enc:v1:");
  assert.equal(encrypted1.includes(sampleCnp), false, "Ciphertext must not contain plaintext CNP");
  assert.notEqual(encrypted1, encrypted2, "Repeated encryption must use distinct random IVs");

  const decrypted = decryptPII(encrypted1);
  assert.equal(decrypted, sampleCnp, "Decrypted value must match original CNP");

  const parts = encrypted1.split(":");
  assert.equal(parts.length, 5);
  const tamperedTag = Buffer.from(parts[3], "base64");
  tamperedTag[0] ^= 0xff;
  const tamperedPayload = `enc:v1:${parts[2]}:${tamperedTag.toString("base64")}:${parts[4]}`;

  assert.throws(
    () => decryptPII(tamperedPayload),
    /unable to authenticate data|Invalid|invalid/i,
    "Tampered AuthTag or ciphertext must throw an error"
  );

  const legacyPlaintext = "2900714298456";
  assert.equal(decryptPII(legacyPlaintext), legacyPlaintext);
});

test("[VUP-SEC-002] Admin Secret Hardening & HMAC-SHA256 Session Token Verification", () => {
  process.env.ADMIN_SECRET =
    "9f4c8a2e7b1d6f3a5c8e0b2d4f6a8c1e3b5d7f9a1c3e5b7d9f0a2c4e6b8d0f2a";

  const envFileContent = fs.readFileSync(path.join(projectRoot, "src", "env.ts"), "utf8");
  assert.equal(
    envFileContent.includes("viziune-admin-ploiesti-2026"),
    false,
    "src/env.ts must not contain hardcoded fallback secret viziune-admin-ploiesti-2026"
  );

  const token = createSessionToken();
  assert.equal(verifySessionToken(token), true, "Valid session token must verify");
  assert.equal(verifySessionToken(`${token}tampered`), false, "Tampered session token must fail");
});

test("[VUP-SEC-003] XSS / HTML & CRLF Header Sanitization in email.ts", () => {
  const xssPayload = `<script>alert(1)</script>"'&`;
  const escaped = escapeHtml(xssPayload);

  assert.equal(
    escaped,
    "&lt;script&gt;alert(1)&lt;/script&gt;&quot;&#39;&amp;",
    "escapeHtml must neutralize &, <, >, \", and '"
  );
  assert.equal(escaped.includes("<script>"), false);

  const crlfPayload = "Subiect Valid\r\nBcc: attacker@example.com\0";
  const sanitizedHdr = sanitizeHeader(crlfPayload);
  assert.equal(/[\r\n\0]/.test(sanitizedHdr), false, "sanitizeHeader must strip CR, LF, and NUL");
});

test("[Modulul 5] Supply Chain Pinning in A/package.json (0 occurrences of ^ or ~)", () => {
  const pkgRaw = fs.readFileSync(path.join(projectRoot, "package.json"), "utf8");
  const pkg = JSON.parse(pkgRaw);

  assert.equal(pkgRaw.includes('"^'), false, 'package.json must not contain "^" version prefixes');
  assert.equal(pkgRaw.includes('"~'), false, 'package.json must not contain "~" version prefixes');

  for (const section of ["dependencies", "devDependencies"]) {
    for (const [dep, ver] of Object.entries(pkg[section] || {})) {
      assert.equal(
        ver.startsWith("^") || ver.startsWith("~"),
        false,
        `Dependency ${dep} has unpinned version ${ver}`
      );
    }
  }
});

test("[VUP-SEC-004] Trusted Client IP extraction resists X-Forwarded-For spoofing", () => {
  const prevTrustCf = process.env.TRUST_CLOUDFLARE_PROXY;
  delete process.env.TRUST_CLOUDFLARE_PROXY;

  try {
    const spoofedReq = new Request("https://www.viziuneurbanaploiesti.ro/api/donation", {
      headers: {
        "x-forwarded-for": "1.2.3.4, 198.51.100.42",
      },
    });
    assert.equal(extractTrustedClientIp(spoofedReq), "198.51.100.42");

    const realIpReq = new Request("https://www.viziuneurbanaploiesti.ro/api/admin/auth", {
      headers: {
        "x-forwarded-for": "9.9.9.9, 10.0.0.1",
        "x-real-ip": "203.0.113.10",
      },
    });
    assert.equal(extractTrustedClientIp(realIpReq), "203.0.113.10");

    const vercelReq = new Request("https://www.viziuneurbanaploiesti.ro/api/audit-request", {
      headers: {
        "x-forwarded-for": "9.9.9.9",
        "x-vercel-forwarded-for": "192.0.2.55",
        "x-real-ip": "10.0.0.2",
      },
    });
    assert.equal(extractTrustedClientIp(vercelReq), "192.0.2.55");
  } finally {
    if (prevTrustCf === undefined) delete process.env.TRUST_CLOUDFLARE_PROXY;
    else process.env.TRUST_CLOUDFLARE_PROXY = prevTrustCf;
  }
});

test("[VUP-SEC-005] CSV / Excel formula injection defense & RFC 4180 quoting", () => {
  assert.equal(sanitizeCsvCell("=cmd|' /C calc'!A0"), "'=cmd|' /C calc'!A0");
  assert.equal(sanitizeCsvCell("+SUM(A1:A2)"), "'+SUM(A1:A2)");
  assert.equal(sanitizeCsvCell("-1+1"), "'-1+1");
  assert.equal(sanitizeCsvCell("@HYPERLINK(\"http://evil\")"), `"'\@HYPERLINK(""http://evil"")"`.replace("\\@", "@"));
  assert.equal(sanitizeCsvCell("=1,2"), `"'=1,2"`);
  assert.equal(sanitizeCsvCell("Bloc 14A, Sc. B"), '"Bloc 14A, Sc. B"');
  assert.equal(sanitizeCsvCell("Popescu Ion"), "Popescu Ion");
});

test("[VUP-SEC-006] JPEG EXIF/APP1 metadata stripping keeps image stream intact", () => {
  const soi = Uint8Array.from([0xff, 0xd8]);
  const app1Exif = Uint8Array.from([0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00]);
  const com = Uint8Array.from([0xff, 0xfe, 0x00, 0x04, 0x41, 0x42]);
  const sof0 = Uint8Array.from([0xff, 0xc0, 0x00, 0x04, 0x08, 0x01]);
  const sosAndEoi = Uint8Array.from([0xff, 0xda, 0x00, 0x04, 0x12, 0x34, 0x55, 0xff, 0xd9]);

  const rawJpeg = new Uint8Array([
    ...soi,
    ...app1Exif,
    ...com,
    ...sof0,
    ...sosAndEoi,
  ]);

  const cleaned = stripJpegMetadata(rawJpeg);
  assert.equal(cleaned[0], 0xff);
  assert.equal(cleaned[1], 0xd8);
  assert.equal(Buffer.from(cleaned).includes(Buffer.from("Exif")), false, "APP1 EXIF segment must be stripped");
  assert.equal(cleaned.length, soi.length + sof0.length + sosAndEoi.length);

  const pngSample = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.deepEqual(stripJpegMetadata(pngSample), pngSample, "Non-JPEG buffers must pass through unchanged");
});

test("[VUP-SEC-007] CSRF protection rejects cross-site origins and allows same-origin", () => {
  const crossSiteReq = new Request("https://www.viziuneurbanaploiesti.ro/api/admin/data", {
    method: "POST",
    headers: {
      host: "www.viziuneurbanaploiesti.ro",
      "sec-fetch-site": "cross-site",
      origin: "https://evil.example",
    },
  });
  assert.equal(verifySameOriginRequest(crossSiteReq).allowed, false);

  const mismatchedOriginReq = new Request("https://www.viziuneurbanaploiesti.ro/api/donation", {
    method: "POST",
    headers: {
      host: "www.viziuneurbanaploiesti.ro",
      origin: "https://attacker.example",
    },
  });
  assert.equal(verifySameOriginRequest(mismatchedOriginReq).allowed, false);

  const opaqueOriginReq = new Request("https://www.viziuneurbanaploiesti.ro/api/donation", {
    method: "POST",
    headers: {
      host: "www.viziuneurbanaploiesti.ro",
      origin: "null",
    },
  });
  assert.equal(verifySameOriginRequest(opaqueOriginReq).allowed, false);

  const validReq = new Request("https://www.viziuneurbanaploiesti.ro/api/admin/data", {
    method: "POST",
    headers: {
      host: "www.viziuneurbanaploiesti.ro",
      "sec-fetch-site": "same-origin",
      origin: "https://www.viziuneurbanaploiesti.ro",
    },
  });
  assert.equal(verifySameOriginRequest(validReq).allowed, true);
});

test("[VUP-SEC-008] Production PII key decoupling & structured logger redaction", () => {
  const prevNodeEnv = process.env.NODE_ENV;
  const prevPiiKey = process.env.PII_ENCRYPTION_KEY;
  const prevAdminSecret = process.env.ADMIN_SECRET;

  try {
    process.env.NODE_ENV = "production";
    process.env.ADMIN_SECRET = "9f4c8a2e7b1d6f3a5c8e0b2d4f6a8c1e3b5d7f9a1c3e5b7d9f0a2c4e6b8d0f2a";
    delete process.env.PII_ENCRYPTION_KEY;

    assert.throws(
      () => encryptPII("1890101290016"),
      /PII_ENCRYPTION_KEY/,
      "Production must refuse to encrypt PII using ADMIN_SECRET fallback"
    );

    process.env.PII_ENCRYPTION_KEY = process.env.ADMIN_SECRET;
    assert.throws(
      () => encryptPII("1890101290016"),
      /identică cu ADMIN_SECRET/i,
      "Production must reject PII_ENCRYPTION_KEY equal to ADMIN_SECRET"
    );
  } finally {
    process.env.NODE_ENV = prevNodeEnv;
    if (prevPiiKey === undefined) delete process.env.PII_ENCRYPTION_KEY;
    else process.env.PII_ENCRYPTION_KEY = prevPiiKey;
    if (prevAdminSecret === undefined) delete process.env.ADMIN_SECRET;
    else process.env.ADMIN_SECRET = prevAdminSecret;
  }

  const sanitized = sanitizeLogValue({
    cnp: "1890101290016",
    phone: "0722000111",
    email: "cetatean@example.ro",
    address: "Str. Exemplu nr. 10",
    signatureDataUrl: "data:image/png;base64,abc",
    token: "secret-tok",
    cookie: "vup_admin_session=xyz",
    stack: "Error stack trace",
    correlationId: "req-123",
    note: "CNP 2900714298456 verificat",
  });

  assert.equal(sanitized.cnp, "[REDACTED]");
  assert.equal(sanitized.phone, "[REDACTED]");
  assert.equal(sanitized.email, "[REDACTED]");
  assert.equal(sanitized.address, "[REDACTED]");
  assert.equal(sanitized.signatureDataUrl, "[REDACTED]");
  assert.equal(sanitized.token, "[REDACTED]");
  assert.equal(sanitized.cookie, "[REDACTED]");
  assert.equal(sanitized.stack, "[REDACTED]");
  assert.equal(sanitized.correlationId, "req-123");
  assert.equal(sanitized.note, "CNP [REDACTED_CNP] verificat");
});

test("[VUP-SEC-009] Single-hop canonical www redirect and disabled X-Powered-By header", () => {
  const nextConfigContent = fs.readFileSync(path.join(projectRoot, "next.config.ts"), "utf8");
  assert.equal(nextConfigContent.includes("poweredByHeader: false"), true);
  assert.equal(
    nextConfigContent.includes('destination: "https://www.viziuneurbanaploiesti.ro/:path*"'),
    true,
    "vercel.app host must redirect directly to canonical www domain in a single hop"
  );
});

test("[VUP-SEC-010] HTTP security headers, __Host- cookie prefix & removed unused anon client", () => {
  const proxyContent = fs.readFileSync(path.join(projectRoot, "src", "proxy.ts"), "utf8");
  const nextConfigContent = fs.readFileSync(path.join(projectRoot, "next.config.ts"), "utf8");
  const supabaseContent = fs.readFileSync(path.join(projectRoot, "src", "lib", "supabase.ts"), "utf8");
  const authContent = fs.readFileSync(path.join(projectRoot, "src", "lib", "auth.ts"), "utf8");

  for (const requiredToken of [
    "Cross-Origin-Opener-Policy",
    "same-origin",
    "X-XSS-Protection",
    "object-src 'none'",
    "upgrade-insecure-requests",
    "X-Robots-Tag",
    "noindex, nofollow",
    "private, no-store, max-age=0",
    "Cookie, Authorization",
  ]) {
    assert.equal(
      proxyContent.includes(requiredToken),
      true,
      `src/proxy.ts must enforce ${requiredToken}`
    );
  }

  assert.equal(proxyContent.includes("'strict-dynamic'"), false, "CSP must not include 'strict-dynamic'");
  assert.equal(nextConfigContent.includes("Cross-Origin-Opener-Policy"), true);
  assert.equal(nextConfigContent.includes("X-XSS-Protection"), true);
  assert.equal(supabaseContent.includes("export const supabase ="), false, "Unused anon Supabase client must be removed");
  assert.equal(authContent.includes("__Host-vup_admin_session"), true, "Production session cookie must use __Host- prefix");
});

test("[VUP-SEC-011] Supabase build-safety without secrets vs. production runtime fail-closed", () => {
  const harnessScript = `
    import { registerHooks } from "node:module";
    import { pathToFileURL } from "node:url";
    import path from "node:path";

    const projectRoot = process.cwd();
    registerHooks({
      resolve(specifier, context, nextResolve) {
        if (specifier === "../env") {
          return {
            shortCircuit: true,
            url: pathToFileURL(path.join(projectRoot, "src", "env.ts")).href,
          };
        }
        return nextResolve(specifier, context);
      },
    });

    const mod = await import(pathToFileURL(path.join(projectRoot, "src", "lib", "supabase.ts")).href);
    if (!mod.supabaseAdmin) {
      throw new Error("Missing supabaseAdmin export");
    }
    console.log("SUPABASE_INIT_OK");
  `;

  const minimalEnv = {
    ...(process.env.PATH ? { PATH: process.env.PATH } : {}),
    ...(process.env.SystemRoot ? { SystemRoot: process.env.SystemRoot } : {}),
  };

  const buildResult = spawnSync(
    process.execPath,
    ["--conditions=react-server", "--experimental-strip-types", "--input-type=module", "-e", harnessScript],
    {
      cwd: projectRoot,
      env: {
        ...minimalEnv,
        NODE_ENV: "production",
        NEXT_PHASE: "phase-production-build",
      },
      encoding: "utf8",
    }
  );
  assert.equal(
    buildResult.status,
    0,
    `Next build phase without secrets must not throw. stderr: ${buildResult.stderr}`
  );
  assert.equal(buildResult.stdout.includes("SUPABASE_INIT_OK"), true);

  const missingKeyResult = spawnSync(
    process.execPath,
    ["--conditions=react-server", "--experimental-strip-types", "--input-type=module", "-e", harnessScript],
    {
      cwd: projectRoot,
      env: {
        ...minimalEnv,
        NODE_ENV: "production",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        ADMIN_SECRET: "9f4c8a2e7b1d6f3a5c8e0b2d4f6a8c1e3b5d7f9a1c3e5b7d9f0a2c4e6b8d0f2a",
        PII_ENCRYPTION_KEY: "3e7a1c5f9b2d4e8a6c0f2b4d6e8a0c2f4b6d8e0a2c4f6b8d0e2a4c6f8b0d2e4a",
        ADMIN_PASSWORD: "test-password",
      },
      encoding: "utf8",
    }
  );
  assert.notEqual(missingKeyResult.status, 0, "Production runtime without SUPABASE_SERVICE_ROLE_KEY must fail closed");
  assert.equal(
    missingKeyResult.stderr.includes("SUPABASE_SERVICE_ROLE_KEY"),
    true,
    `Expected SUPABASE_SERVICE_ROLE_KEY error, got: ${missingKeyResult.stderr}`
  );

  const missingUrlResult = spawnSync(
    process.execPath,
    ["--conditions=react-server", "--experimental-strip-types", "--input-type=module", "-e", harnessScript],
    {
      cwd: projectRoot,
      env: {
        ...minimalEnv,
        NODE_ENV: "production",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-test-key",
        ADMIN_SECRET: "9f4c8a2e7b1d6f3a5c8e0b2d4f6a8c1e3b5d7f9a1c3e5b7d9f0a2c4e6b8d0f2a",
        PII_ENCRYPTION_KEY: "3e7a1c5f9b2d4e8a6c0f2b4d6e8a0c2f4b6d8e0a2c4f6b8d0e2a4c6f8b0d2e4a",
        ADMIN_PASSWORD: "test-password",
      },
      encoding: "utf8",
    }
  );
  assert.notEqual(missingUrlResult.status, 0, "Production runtime without NEXT_PUBLIC_SUPABASE_URL must fail closed");
  assert.equal(
    missingUrlResult.stderr.includes("NEXT_PUBLIC_SUPABASE_URL"),
    true,
    `Expected NEXT_PUBLIC_SUPABASE_URL error, got: ${missingUrlResult.stderr}`
  );
});

test("[Modulul 5] SEO Sitemap Hygiene (canonical www URLs only, zero hash/admin/api)", () => {
  const prevSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;

  try {
    const entries = sitemap();
    assert.equal(Array.isArray(entries) && entries.length >= 1, true, "Sitemap must return entries");

    for (const entry of entries) {
      assert.equal(
        entry.url.startsWith("https://www.viziuneurbanaploiesti.ro/"),
        true,
        `Sitemap URL must use canonical www host: ${entry.url}`
      );
      assert.equal(entry.url.includes("#"), false, `Sitemap URL must not contain #hash: ${entry.url}`);
      assert.equal(entry.url.includes("/admin"), false, `Sitemap URL must not expose /admin: ${entry.url}`);
      assert.equal(entry.url.includes("/api"), false, `Sitemap URL must not expose /api: ${entry.url}`);
    }
  } finally {
    if (prevSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = prevSiteUrl;
  }
});

test("[Modulul 5] Server/Client Module Isolation (zero server module imports in 'use client' files)", () => {
  const srcDir = path.join(projectRoot, "src");
  const forbiddenImportPatterns = [
    /@\/lib\/supabase\b/,
    /@\/lib\/db\b/,
    /@\/lib\/pii-crypto\b/,
    /@\/lib\/auth\b/,
    /@\/lib\/email\b/,
    /\.\.\/lib\/(?:supabase|db|pii-crypto|auth|email)\b/,
    /^["'](?:node:)?(?:crypto|fs)["']$/,
  ];

  function collectSourceFiles(dir) {
    const out = [];
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        out.push(...collectSourceFiles(fullPath));
      } else if (item.isFile() && /\.(?:ts|tsx)$/.test(item.name)) {
        out.push(fullPath);
      }
    }
    return out;
  }

  let clientFilesChecked = 0;
  for (const filePath of collectSourceFiles(srcDir)) {
    const content = fs.readFileSync(filePath, "utf8");
    const isClientFile = /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*["']use client["']/.test(content);
    if (!isClientFile) continue;

    clientFilesChecked += 1;
    const importRegex = /(?:from\s+|import\s*\(|require\s*\()\s*["']([^"']+)["']/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const specifier = match[1];
      const quotedSpecifier = `"${specifier}"`;
      for (const forbidden of forbiddenImportPatterns) {
        assert.equal(
          forbidden.test(specifier) || forbidden.test(quotedSpecifier),
          false,
          `Client component ${path.relative(projectRoot, filePath)} must not import server module "${specifier}"`
        );
      }
    }
  }

  assert.equal(clientFilesChecked > 0, true, "Expected at least one 'use client' file in src/");
});

// =========================================================================
// Audit Defensiv Regression Tests ([SEC-AUDIT-01] .. [SEC-AUDIT-09])
// =========================================================================

test("[SEC-AUDIT-01] encryptPII always encrypts enc:v1: inputs, PNG signature validation is strict, and batch decryption isolates corrupted rows", () => {
  process.env.PII_ENCRYPTION_KEY =
    "3e7a1c5f9b2d4e8a6c0f2b4d6e8a0c2f4b6d8e0a2c4f6b8d0e2a4c6f8b0d2e4a";

  const forgedPrefix = "enc:v1:not-a-valid-ciphertext-payload";
  const encrypted = encryptPII(forgedPrefix);
  assert.notEqual(encrypted, forgedPrefix, "encryptPII must not bypass inputs prefixed with enc:v1:");
  assert.equal(decryptPII(encrypted), forgedPrefix, "Round-trip decryption must restore literal input");

  const validPng = buildSamplePngDataUrl();
  assert.equal(isValidPngSignatureDataUrl(validPng), true);
  assert.equal(isValidPngSignatureDataUrl("https://evil.example/sig.png"), false);
  assert.equal(isValidPngSignatureDataUrl("enc:v1:forged"), false);
  assert.equal(
    isValidPngSignatureDataUrl("data:image/png;base64," + Buffer.from("<svg><script>").toString("base64")),
    false
  );
  assert.equal(isValidPngSignatureDataUrl("data:image/png;base64," + "A".repeat(360_000)), false);

  const validRow = {
    id: "f230-valid",
    created_at: "2026-11-20T10:00:00Z",
    last_name: "Popescu",
    first_name: "Ion",
    initiala_tata: "M",
    cnp: encryptPII("1890101290016"),
    email: "ion@example.ro",
    phone: "0722123456",
    address: "Str. Exemplu nr. 1",
    city: "Ploiești",
    county: "Prahova",
    signature_data_url: encryptPII(validPng),
    distribute_for_2_years: true,
    consent_borderou: true,
    status: "inregistrat",
  };

  const corruptedRow = {
    ...validRow,
    id: "f230-corrupted",
    cnp: "enc:v1:corrupted-payload",
    signature_data_url: "enc:v1:bad:tag:cipher",
  };

  const decryptedRows = mapAndDecryptFormular230Rows([corruptedRow, validRow]);
  assert.equal(decryptedRows.length, 2, "One corrupted row must not wipe out remaining rows");
  assert.equal(decryptedRows[0].cnp, "[EROARE DECRIPTARE]");
  assert.equal(decryptedRows[0].signatureDataUrl, "");
  assert.equal(decryptedRows[1].cnp, "1890101290016");
  assert.equal(decryptedRows[1].signatureDataUrl, validPng);
});

test("[SEC-AUDIT-02] extractTrustedClientIp requires opt-in for cf-connecting-ip and public association listing filters unmoderated statuses", () => {
  const prevTrustCf = process.env.TRUST_CLOUDFLARE_PROXY;
  delete process.env.TRUST_CLOUDFLARE_PROXY;

  try {
    const req = new Request("https://www.viziuneurbanaploiesti.ro/api/admin/auth", {
      headers: {
        "cf-connecting-ip": "198.51.100.99",
        "x-vercel-forwarded-for": "203.0.113.10",
      },
    });
    assert.equal(extractTrustedClientIp(req), "203.0.113.10");

    process.env.TRUST_CLOUDFLARE_PROXY = "true";
    assert.equal(extractTrustedClientIp(req), "198.51.100.99");
  } finally {
    if (prevTrustCf === undefined) delete process.env.TRUST_CLOUDFLARE_PROXY;
    else process.env.TRUST_CLOUDFLARE_PROXY = prevTrustCf;
  }

  const base = {
    name: "Contact Test",
    phone: "0722000111",
    address: "Str. Test nr. 1, Ploiești",
    problem: "Descriere tehnică test",
    formsCollected: 10,
    formsTarget: 40,
    fundsCollected: 1000,
    fundsTarget: 10000,
    createdAt: "2026-11-20T10:00:00Z",
  };
  const visible = filterPublicAssociations([
    { ...base, id: "a1", building: "Bloc Nou", status: "nou" },
    { ...base, id: "a2", building: "Bloc Respins", status: "respins" },
    { ...base, id: "a3", building: "Bloc Evaluare", status: "in_evaluare" },
    { ...base, id: "a4", building: "Bloc Acceptat", status: "acceptat" },
    { ...base, id: "a5", building: "Bloc Finalizat", status: "finalizat" },
  ]);

  assert.deepEqual(
    visible.map((a) => a.id),
    ["a3", "a4", "a5"]
  );
});

test("[SEC-AUDIT-03] Session logout revokes tokens server-side and Same-Origin verification fails closed", async () => {
  process.env.ADMIN_SECRET =
    "9f4c8a2e7b1d6f3a5c8e0b2d4f6a8c1e3b5d7f9a1c3e5b7d9f0a2c4e6b8d0f2a";

  const token = createSessionToken();
  const reqCookie = new Request("https://www.viziuneurbanaploiesti.ro/api/admin/data", {
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${token}`,
    },
  });
  const reqBearerOnly = new Request("https://www.viziuneurbanaploiesti.ro/api/admin/data", {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  assert.equal(extractSessionTokenFromRequest(reqCookie), token);
  assert.equal(extractSessionTokenFromRequest(reqBearerOnly), null);
  assert.equal(await isRequestAuthenticatedAsync(reqCookie), true);
  assert.equal(await isRequestAuthenticatedAsync(reqBearerOnly), false);

  await revokeSessionToken(token);
  assert.equal(verifySessionToken(token), false);
  assert.equal(await isSessionTokenRevokedAsync(token), true);
  assert.equal(await isRequestAuthenticatedAsync(reqCookie), false);

  const missingOriginAndReferer = new Request("https://www.viziuneurbanaploiesti.ro/api/admin/data", {
    method: "POST",
  });
  assert.equal(verifySameOriginRequest(missingOriginAndReferer).allowed, false);

  const forgedForwardedHost = new Request("https://www.viziuneurbanaploiesti.ro/api/admin/data", {
    method: "POST",
    headers: {
      "x-forwarded-host": "untrusted.example",
      origin: "https://untrusted.example",
    },
  });
  assert.equal(verifySameOriginRequest(forgedForwardedHost).allowed, false);
});

test("[SEC-AUDIT-04] Wildcard *.supabase.co patterns are absent from next.config.ts and proxy.ts", () => {
  const nextConfigContent = fs.readFileSync(path.join(projectRoot, "next.config.ts"), "utf8");
  const proxyContent = fs.readFileSync(path.join(projectRoot, "src", "proxy.ts"), "utf8");

  assert.equal(nextConfigContent.includes("*.supabase.co"), false);
  assert.equal(proxyContent.includes("*.supabase.co"), false);
});

test("[SEC-AUDIT-05] readJsonWithLimit aborts oversized streams before parse and URL validation blocks unsafe schemes", async () => {
  const largeBody = JSON.stringify({ problem: "x".repeat(25_000) });
  const oversizedReq = new Request("https://www.viziuneurbanaploiesti.ro/api/audit-request", {
    method: "POST",
    body: largeBody,
  });

  await assert.rejects(
    () => readJsonWithLimit(oversizedReq, 16_384),
    (err) => err instanceof PayloadTooLargeError
  );

  const badJsonReq = new Request("https://www.viziuneurbanaploiesti.ro/api/audit-request", {
    method: "POST",
    body: "{not valid json",
  });
  await assert.rejects(
    () => readJsonWithLimit(badJsonReq, 16_384),
    (err) => err instanceof InvalidJsonBodyError
  );

  assert.equal(validateSafeMediaOrLinkUrl("javascript:alert(1)"), false);
  assert.equal(validateSafeMediaOrLinkUrl("data:text/html,<script>alert(1)</script>"), false);
  assert.equal(validateSafeMediaOrLinkUrl("//evil.example/img.png"), false);
  assert.equal(validateSafeMediaOrLinkUrl("/ref-assets/after-C5YhGlz_.png"), true);
  assert.equal(validateSafeMediaOrLinkUrl("https://viziuneurbanaploiesti.ro", { allowRelative: false }), true);
});

test("[SEC-AUDIT-06] parseAllowedStorageTarget restricts deletions to matching origin, bucket, and flat file key", () => {
  const base = "https://proj.supabase.co";
  assert.equal(
    parseAllowedStorageTarget("https://other.supabase.co/storage/v1/object/public/proiecte/a.jpg", base),
    null
  );
  assert.equal(
    parseAllowedStorageTarget("https://proj.supabase.co/storage/v1/object/public/private-backups/db.sql", base),
    null
  );
  assert.equal(
    parseAllowedStorageTarget("https://proj.supabase.co/storage/v1/object/public/proiecte/../secret.jpg", base),
    null
  );
  assert.equal(
    parseAllowedStorageTarget("https://proj.supabase.co/storage/v1/object/public/proiecte/sub%2Fdir.jpg", base),
    null
  );
  assert.deepEqual(
    parseAllowedStorageTarget("https://proj.supabase.co/storage/v1/object/public/proiecte/img_123.jpg?t=1", base),
    { bucket: "proiecte", filePath: "img_123.jpg" }
  );
  assert.deepEqual(
    parseAllowedStorageTarget("https://proj.supabase.co/storage/v1/object/public/Proiecte/img_123.webp", base),
    { bucket: "Proiecte", filePath: "img_123.webp" }
  );
});

test("[SEC-AUDIT-07] PNG and WebP metadata stripping removes EXIF/XMP/tEXt chunks and Math.random() is absent from src/", () => {
  const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = buildPngChunk("IHDR", Buffer.alloc(13));
  const exifChunk = buildPngChunk("eXIf", Buffer.from("ExifGPSData"));
  const textChunk = buildPngChunk("tEXt", Buffer.from("Author\0Secret"));
  const idat = buildPngChunk("IDAT", Buffer.from([1, 2, 3, 4]));
  const iend = buildPngChunk("IEND", Buffer.alloc(0));

  const dirtyPng = Buffer.concat([pngSig, ihdr, exifChunk, textChunk, idat, iend]);
  const cleanPng = Buffer.from(stripPngMetadata(dirtyPng));
  assert.equal(cleanPng.includes("eXIf"), false);
  assert.equal(cleanPng.includes("tEXt"), false);
  assert.equal(cleanPng.includes("IHDR"), true);
  assert.equal(cleanPng.includes("IDAT"), true);
  assert.equal(cleanPng.includes("IEND"), true);

  const vp8xPayload = Buffer.alloc(10);
  vp8xPayload[0] = 0x1c; // ICC (0x10) + EXIF (0x08) + XMP (0x04)
  const vp8xHeader = Buffer.concat([Buffer.from("VP8X", "ascii"), Buffer.from([10, 0, 0, 0]), vp8xPayload]);
  const vp8Chunk = Buffer.concat([Buffer.from("VP8 ", "ascii"), Buffer.from([4, 0, 0, 0]), Buffer.from([1, 2, 3, 4])]);
  const exifWebp = Buffer.concat([Buffer.from("EXIF", "ascii"), Buffer.from([4, 0, 0, 0]), Buffer.from("Exif")]);
  const xmpWebp = Buffer.concat([Buffer.from("XMP ", "ascii"), Buffer.from([4, 0, 0, 0]), Buffer.from("Xmp!")]);
  const bodyChunks = Buffer.concat([vp8xHeader, vp8Chunk, exifWebp, xmpWebp]);
  const riffSizeBuf = Buffer.alloc(4);
  riffSizeBuf.writeUInt32LE(4 + bodyChunks.length, 0);
  const dirtyWebp = Buffer.concat([Buffer.from("RIFF"), riffSizeBuf, Buffer.from("WEBP"), bodyChunks]);

  const cleanWebp = Buffer.from(stripWebpMetadata(dirtyWebp));
  assert.equal(cleanWebp.includes("EXIF"), false);
  assert.equal(cleanWebp.includes("XMP "), false);
  assert.equal(cleanWebp.readUInt32LE(4), cleanWebp.length - 8, "RIFF chunk size must match stripped buffer length");
  assert.equal(cleanWebp[12 + 8], 0x10, "VP8X EXIF/XMP bits must be cleared while keeping ICC bit");

  const srcDir = path.join(projectRoot, "src");
  function scanMathRandom(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) scanMathRandom(full);
      else if (item.isFile() && /\.(?:ts|tsx)$/.test(item.name)) {
        const txt = fs.readFileSync(full, "utf8");
        assert.equal(txt.includes("Math.random("), false, `${full} must not call Math.random()`);
      }
    }
  }
  scanMathRandom(srcDir);
});

test("[SEC-AUDIT-08] CNP county validation, local QR SVG asset, and non-prechecked GDPR consent", () => {
  for (const invalidCountyCnp of ["1890101000011", "1890101490015", "1890101500014", "1890101990018"]) {
    const res = validateRomanianCnp(invalidCountyCnp);
    assert.equal(res.isValid, false, `County code in ${invalidCountyCnp} must be rejected`);
  }
  for (const validCountyCnp of ["1890101290016", "1890101510011", "1890101520019", "1890101700013"]) {
    const res = validateRomanianCnp(validCountyCnp);
    assert.equal(res.isValid, true, `Valid county CNP ${validCountyCnp} must pass`);
  }

  const noticeModal = fs.readFileSync(
    path.join(projectRoot, "src", "components", "admin", "NoticeBoardModal.tsx"),
    "utf8"
  );
  assert.equal(noticeModal.includes("api.qrserver.com"), false);
  assert.equal(noticeModal.includes("/qr-formular-230.svg"), true);
  assert.equal(fs.existsSync(path.join(projectRoot, "public", "qr-formular-230.svg")), true);

  const wizard = fs.readFileSync(
    path.join(projectRoot, "src", "components", "form230", "Formular230Wizard.tsx"),
    "utf8"
  );
  assert.equal(
    /const\s*\[\s*consentGdpr\s*,\s*setConsentGdpr\s*\]\s*=\s*useState\(\s*false\s*\)/.test(wizard),
    true,
    "GDPR consent checkbox must default to false"
  );
});

test("[SEC-AUDIT-09] normalizeDonationStatus preserves 'arhivat' instead of resetting to 'inregistrat'", () => {
  assert.equal(normalizeDonationStatus("arhivat"), "arhivat");
  assert.equal(normalizeDonationStatus("confirmat"), "confirmat");
  assert.equal(normalizeDonationStatus("finalizat"), "finalizat");
  assert.equal(normalizeDonationStatus("inregistrat"), "inregistrat");
  assert.equal(normalizeDonationStatus("unexpected_value"), "inregistrat");
});
