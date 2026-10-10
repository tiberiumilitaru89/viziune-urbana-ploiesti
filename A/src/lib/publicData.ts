import { 
  PublicAssociationSummary, 
  PartnerItem, 
  ProjectItem, 
  GlobalMetrics, 
  OngConfig 
} from "./types";
import { 
  INITIAL_ASSOCIATIONS, 
  INITIAL_PARTNERS, 
  INITIAL_PROJECTS, 
  INITIAL_METRICS 
} from "./data";
import { detectNeighborhood } from "./neighborhoods";

export type PublicDataBundle = {
  readonly associations: readonly PublicAssociationSummary[];
  readonly partners: readonly PartnerItem[];
  readonly projects: readonly ProjectItem[];
  readonly metrics: GlobalMetrics;
  readonly ongConfig: OngConfig;
};

// Singleton Client-Side In-Memory Cache & In-Flight Promise Deduplication
let clientCache: PublicDataBundle | null = null;
let clientFetchPromise: Promise<PublicDataBundle> | null = null;
let lastFetchTime = 0;
const CLIENT_CACHE_TTL_MS = 60 * 1000; // 60 de secunde TTL în memoria browserului

export function invalidateClientPublicDataCache(): void {
  clientCache = null;
  lastFetchTime = 0;
}

export async function fetchPublicDataClient(): Promise<PublicDataBundle> {
  const now = Date.now();
  if (clientCache && now - lastFetchTime < CLIENT_CACHE_TTL_MS) {
    return clientCache;
  }

  if (clientFetchPromise) {
    return clientFetchPromise;
  }

  clientFetchPromise = (async (): Promise<PublicDataBundle> => {
    try {
      const res = await fetch("/api/public/data");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json: {
        readonly success: boolean;
        readonly data?: {
          readonly associations?: readonly PublicAssociationSummary[];
          readonly partners?: readonly PartnerItem[];
          readonly projects?: readonly ProjectItem[];
          readonly metrics?: GlobalMetrics;
          readonly ongConfig?: OngConfig;
        };
      } = await res.json();

      if (json.success && json.data) {
        const bundle: PublicDataBundle = {
          associations: json.data.associations ?? [],
          partners: json.data.partners ?? [],
          projects: json.data.projects ?? [],
          metrics: json.data.metrics ?? INITIAL_METRICS,
          ongConfig: json.data.ongConfig ?? {
            name: "Asociația Viziune Urbană Ploiești",
            cif: "48923410",
            iban: "RO94BACX0000004234473000",
            bank: "UniCredit Bank România",
            percentage: "3,5%",
            distributeYears: 2,
          },
        };
        clientCache = bundle;
        lastFetchTime = Date.now();
        return bundle;
      }
      throw new Error("Format răspuns invalid");
    } catch {
      // Fallback deterministic în caz de offline sau eroare de transport
      const fallbackBundle: PublicDataBundle = {
        associations: INITIAL_ASSOCIATIONS.map((r, idx) => ({
          id: r.id,
          dosarNumber: r.dosarNumber ?? `DOSAR-PH-${101 + idx}`,
          building: r.building,
          address: r.address,
          neighborhood: r.neighborhood ?? detectNeighborhood(r.address, r.building),
          problem: r.problem,
          status: r.status,
          formsCollected: r.formsCollected,
          formsTarget: r.formsTarget,
          fundsCollected: r.fundsCollected,
          fundsTarget: r.fundsTarget,
          createdAt: r.createdAt,
        })),
        partners: INITIAL_PARTNERS,
        projects: INITIAL_PROJECTS.filter((p) => p.status === "finalizat" && !p.isArchived),
        metrics: INITIAL_METRICS,
        ongConfig: {
          name: "Asociația Viziune Urbană Ploiești",
          cif: "48923410",
          iban: "RO94BACX0000004234473000",
          bank: "UniCredit Bank România",
          percentage: "3,5%",
          distributeYears: 2,
        },
      };
      return fallbackBundle;
    } finally {
      clientFetchPromise = null;
    }
  })();

  return clientFetchPromise;
}
