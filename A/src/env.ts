import { z } from "zod";

export function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production" && !isBuildPhase();
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
    ADMIN_SECRET: z.string().min(32).optional(),
    PII_ENCRYPTION_KEY: z.string().min(32).optional(),
    // TODO(SEC-AUDIT-03): Crește pragul la min(12) imediat după rotirea ADMIN_PASSWORD în Vercel & .env.local
    ADMIN_PASSWORD: z.string().min(1).max(128).optional(),
    ADMIN_PASSWORD_SCRYPT_HASH: z.string().min(32).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  })
  .refine(
    (data) => {
      if (isProductionRuntime() && data.NODE_ENV === "production") {
        return Boolean(data.ADMIN_SECRET && data.ADMIN_SECRET.trim().length >= 32);
      }
      return true;
    },
    {
      message: "În producție este obligatorie configurarea unui ADMIN_SECRET criptografic (minim 32 caractere).",
      path: ["ADMIN_SECRET"],
    }
  )
  .refine(
    (data) => {
      if (isProductionRuntime() && data.NODE_ENV === "production") {
        return Boolean(
          data.PII_ENCRYPTION_KEY &&
            data.PII_ENCRYPTION_KEY.trim().length >= 32 &&
            data.PII_ENCRYPTION_KEY.trim() !== data.ADMIN_SECRET?.trim()
        );
      }
      return true;
    },
    {
      message:
        "În producție este obligatorie o cheie dedicată PII_ENCRYPTION_KEY (minim 32 caractere, distinctă de ADMIN_SECRET).",
      path: ["PII_ENCRYPTION_KEY"],
    }
  )
  .refine(
    (data) => {
      if (isProductionRuntime() && data.NODE_ENV === "production") {
        return Boolean(data.SUPABASE_SERVICE_ROLE_KEY && data.SUPABASE_SERVICE_ROLE_KEY.trim().length > 0);
      }
      return true;
    },
    {
      message: "În producție este obligatorie variabila SUPABASE_SERVICE_ROLE_KEY.",
      path: ["SUPABASE_SERVICE_ROLE_KEY"],
    }
  )
  .refine(
    (data) => {
      if (isProductionRuntime() && data.NODE_ENV === "production") {
        const hasPlainPassword = Boolean(data.ADMIN_PASSWORD && data.ADMIN_PASSWORD.trim().length > 0);
        const hasScryptHash = Boolean(
          data.ADMIN_PASSWORD_SCRYPT_HASH && data.ADMIN_PASSWORD_SCRYPT_HASH.trim().length >= 32
        );
        return hasPlainPassword || hasScryptHash;
      }
      return true;
    },
    {
      message:
        "În producție este obligatorie configurarea ADMIN_PASSWORD sau ADMIN_PASSWORD_SCRYPT_HASH.",
      path: ["ADMIN_PASSWORD"],
    }
  );

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  ADMIN_SECRET: process.env.ADMIN_SECRET,
  PII_ENCRYPTION_KEY: process.env.PII_ENCRYPTION_KEY,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_PASSWORD_SCRYPT_HASH: process.env.ADMIN_PASSWORD_SCRYPT_HASH,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});
