import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { encryptPII, decryptPII } from "../src/lib/pii-crypto.ts";
import { escapeHtml, sanitizeHeader } from "../src/lib/email.ts";
import { createSessionToken, verifySessionToken } from "../src/lib/auth.ts";

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
