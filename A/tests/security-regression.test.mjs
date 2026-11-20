import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sitemap from "../src/app/sitemap.ts";
import { encryptPII, decryptPII } from "../src/lib/pii-crypto.ts";
import { escapeHtml, sanitizeHeader } from "../src/lib/email.ts";
import { createSessionToken, verifySessionToken } from "../src/lib/auth.ts";
import {
  extractTrustedClientIp,
  sanitizeCsvCell,
  sanitizeLogValue,
  stripJpegMetadata,
  verifySameOriginRequest,
} from "../src/lib/security-utils.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

test("[VUP-SEC-001] AES-256-GCM PII Encryption & Decryption (CNP & Signature)", () => {
  process.env.PII_ENCRYPTION_KEY =
    "3e7a1c5f9b2d4e8a6c0f2b4d6e8a0c2f4b6d8e0a2c4f6b8d0e2a4c6f8b0d2e4a";

  const sampleCnp = "1890101290011";
  const encrypted1 = encryptPII(sampleCnp);
  const encrypted2 = encryptPII(sampleCnp);

  // 1. Format enc:v1:<iv>:<tag>:<cipher> și absența CNP-ului în clar
  assert.equal(encrypted1.startsWith("enc:v1:"), true, "Ciphertext must start with enc:v1:");
  assert.equal(encrypted1.includes(sampleCnp), false, "Ciphertext must not contain plaintext CNP");

  // 2. IV aleator de 12 octeți produce ciphertext diferit la apeluri succesive
  assert.notEqual(encrypted1, encrypted2, "Repeated encryption must use distinct random IVs");

  // 3. Decriptare deterministă la valoarea inițială
  const decrypted = decryptPII(encrypted1);
  assert.equal(decrypted, sampleCnp, "Decrypted value must match original CNP");

  // 4. Detectarea alterării ciphertext-ului / AuthTag-ului (GCM Integrity)
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

  // 5. Compatibilitate zero-downtime cu rânduri istorice necriptate
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
      () => encryptPII("1890101290011"),
      /PII_ENCRYPTION_KEY/,
      "Production must refuse to encrypt PII using ADMIN_SECRET fallback"
    );

    process.env.PII_ENCRYPTION_KEY = process.env.ADMIN_SECRET;
    assert.throws(
      () => encryptPII("1890101290011"),
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
    cnp: "1890101290011",
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
    ["--experimental-strip-types", "--input-type=module", "-e", harnessScript],
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
    ["--experimental-strip-types", "--input-type=module", "-e", harnessScript],
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
    ["--experimental-strip-types", "--input-type=module", "-e", harnessScript],
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
