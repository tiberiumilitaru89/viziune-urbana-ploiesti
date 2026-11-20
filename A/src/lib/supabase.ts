import "server-only";
import { createClient } from "@supabase/supabase-js";
import { isBuildPhase } from "../env";

/**
 * Rezolvă configurația Supabase strict server-side:
 * - Fail-closed în producție runtime (lipsește URL-ul sau Service Role Key).
 * - Build-safe în faza Next.js build / CI / dev fără secrete în clar.
 */
function resolveSupabaseAdminConfig(): { url: string; serviceKey: string } {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";

  if (process.env.NODE_ENV === "production" && !isBuildPhase()) {
    if (!rawUrl) {
      throw new Error(
        "EROARE CRITICĂ DE SECURITATE: NEXT_PUBLIC_SUPABASE_URL lipsește din mediul de producție."
      );
    }
    if (!rawServiceKey) {
      throw new Error(
        "EROARE CRITICĂ DE SECURITATE: SUPABASE_SERVICE_ROLE_KEY lipsește din mediul de producție."
      );
    }
  }

  return {
    url: rawUrl || "https://build-placeholder.invalid",
    serviceKey:
      rawServiceKey ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
      "build-placeholder-key",
  };
}

const { url: supabaseUrl, serviceKey: supabaseServiceKey } =
  resolveSupabaseAdminConfig();

// Client exclusiv server-side cu Service Role (blocat la nivel runtime dacă lipsesc secretele)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
