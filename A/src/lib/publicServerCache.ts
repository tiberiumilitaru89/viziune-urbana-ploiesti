import { 
  fetchPublicAssociations, 
  fetchPartners, 
  fetchProjects, 
  fetchMetrics, 
  fetchOngConfig 
} from "./db";
import { 
  PublicAssociationSummary, 
  PartnerItem, 
  ProjectItem, 
  GlobalMetrics, 
  OngConfig 
} from "./types";

export type PublicDataPayload = {
  readonly associations: readonly PublicAssociationSummary[];
  readonly partners: readonly PartnerItem[];
  readonly projects: readonly ProjectItem[];
  readonly metrics: GlobalMetrics;
  readonly ongConfig: OngConfig;
};

// In-Memory Server-Side Cache (Stale-While-Revalidate & Instant Response < 2ms)
let serverMemoryCache: { readonly data: PublicDataPayload; readonly timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 de secunde TTL

export function invalidatePublicDataServerCache(): void {
  serverMemoryCache = null;
}

export async function getCachedPublicData(): Promise<{ readonly data: PublicDataPayload; readonly cached: boolean; readonly degraded?: boolean }> {
  const now = Date.now();

  // 1. Răspuns instant din memorie dacă cache-ul este încă proaspăt (< 2ms)
  if (serverMemoryCache && now - serverMemoryCache.timestamp < CACHE_TTL_MS) {
    return {
      data: serverMemoryCache.data,
      cached: true,
    };
  }

  // 2. Interogare concurentă securizată Supabase
  try {
    const [associations, partners, projects, metrics, ongConfig] = await Promise.all([
      fetchPublicAssociations(),
      fetchPartners(false),
      fetchProjects(false, true), // Doar proiectele finalizate și ne-arhivate
      fetchMetrics(),
      fetchOngConfig(),
    ]);

    const payload: PublicDataPayload = {
      associations,
      partners,
      projects,
      metrics,
      ongConfig,
    };

    serverMemoryCache = {
      data: payload,
      timestamp: now,
    };

    return {
      data: payload,
      cached: false,
    };
  } catch (err) {
    // 3. Circuit Breaker / Graceful Degradation: Dacă Supabase are un blip de rețea, livrăm cache-ul anterior
    if (serverMemoryCache) {
      return {
        data: serverMemoryCache.data,
        cached: true,
        degraded: true,
      };
    }
    throw err;
  }
}
