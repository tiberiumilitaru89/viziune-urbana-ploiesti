import { createClient } from "@supabase/supabase-js";
import { isBuildPhase } from "@/env";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function resolveServiceRoleKey(): string {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (serviceKey) return serviceKey;

  if (process.env.NODE_ENV === "production" && !isBuildPhase()) {
    throw new Error(
      "EROARE CRITICĂ DE SECURITATE: SUPABASE_SERVICE_ROLE_KEY lipsește din mediul de producție."
    );
  }

  return supabaseAnonKey;
}

const supabaseServiceKey = resolveServiceRoleKey();

// Client public pentru operatiuni de frontend/citire
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client cu drepturi depline pentru rute API sigure (Next.js Server / Backend)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
