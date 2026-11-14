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
    ADMIN_PASSWORD: z.string().min(1).optional(),
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
        return Boolean(data.ADMIN_PASSWORD && data.ADMIN_PASSWORD.trim().length > 0);
      }
      return true;
    },
    {
      message: "În producție este obligatorie variabila ADMIN_PASSWORD.",
      path: ["ADMIN_PASSWORD"],
    }
  );

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  ADMIN_SECRET: process.env.ADMIN_SECRET,
  PII_ENCRYPTION_KEY: process.env.PII_ENCRYPTION_KEY,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});
