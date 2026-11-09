import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
    ADMIN_SECRET: z.string().min(32).optional(),
    PII_ENCRYPTION_KEY: z.string().min(32).optional(),
  })
  .refine(
    (data) => {
      if (data.NODE_ENV === "production") {
        return Boolean(data.ADMIN_SECRET && data.ADMIN_SECRET.trim().length >= 32);
      }
      return true;
    },
    {
      message: "În producție este obligatorie configurarea unui ADMIN_SECRET criptografic (minim 32 caractere).",
      path: ["ADMIN_SECRET"],
    }
  );

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  ADMIN_SECRET: process.env.ADMIN_SECRET,
  PII_ENCRYPTION_KEY: process.env.PII_ENCRYPTION_KEY,
});
