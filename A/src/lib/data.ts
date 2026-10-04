import { AuditRequest, ProjectItem, SpecItem, DonationEntry, PublicAssociationSummary } from "./types";

export const INITIAL_ASSOCIATIONS: readonly AuditRequest[] = [
  {
    id: "req-1",
    name: "Mihai Ionescu",
    phone: "0722123456",
    building: "Asociația de Proprietari Bloc 14A",
    address: "B-dul Republicii nr. 112, Ploiești",
    problem: "Coloană colectoare canalizare fisurată în subsol, pierderi constante de apă caldă și miros insuportabil pe casa scării.",
    status: "acceptat",
    formsCollected: 48,
    formsTarget: 50,
    fundsCollected: 14200,
    fundsTarget: 15000,
    createdAt: "2026-08-15T10:00:00Z",
  },
  {
    id: "req-2",
    name: "Elena Dumitrescu",
    phone: "0733987654",
    building: "Asociația Str. Democrației Bloc C3",
    address: "Str. Democrației nr. 24, Ploiești",
    problem: "Țevi de oțel corodate masiv la rețeaua de încălzire, inundație recurentă la fiecare pornire a sezonului rece.",
    status: "acceptat",
    formsCollected: 32,
    formsTarget: 40,
    fundsCollected: 8500,
    fundsTarget: 12000,
    createdAt: "2026-09-02T14:30:00Z",
  },
  {
    id: "req-3",
    name: "Radu Popa",
    phone: "0744556677",
    building: "Asociația Malu Roșu Bloc 32",
    address: "Str. Malu Roșu nr. 8, Ploiești",
    problem: "Toate conductele de apă rece și canalizare din fontă sunt colmatate și sparte pe tronsonul central.",
    status: "in_evaluare",
    formsCollected: 15,
    formsTarget: 45,
    fundsCollected: 3000,
    fundsTarget: 13500,
    createdAt: "2026-09-20T09:15:00Z",
  },
];

export const INITIAL_PROJECTS: readonly ProjectItem[] = [
  {
    id: "proj-1",
    title: "Reabilitare completă subsol Bloc 8B — Cartier Nord",
    description: "Înlocuire integrală 180 metri liniari trasee PPR fibră compozită, izolație Armaflex 19mm, evacuare 4 tone deșeuri și zugrăvire hidro-rezistentă airless.",
    status: "finalizat",
    beforeImage: "/ref-assets/before-DmrOVzle.png",
    afterImage: "/ref-assets/after-C5YhGlz_.png",
    completionDate: "Iulie 2026",
  },
  {
    id: "proj-2",
    title: "Modernizare magistrală termică & apă rece — Bloc 21A Centru",
    description: "Eliminarea pierderilor de căldură de 35% prin izolarea conductelor primare și instalarea de robineți de închidere sferici cu garanție industrială.",
    status: "finalizat",
    beforeImage: "/subsol-reabilitat.jpg",
    afterImage: "/tehnician-tevi-cupru.jpg",
    completionDate: "August 2026",
  },
];

export const SPEC_ITEMS: readonly SpecItem[] = [
  {
    orderNum: 1,
    title: "Evacuare resturi și igienizare subsol",
    description: "Curățarea și evacuarea completă a resturilor de moloz, conductelor vechi și a oricăror deșeuri existente în subsol, urmată de igienizare generală.",
    image: "/ref-assets/sanitation-DG9U3mKz.png",
  },
  {
    orderNum: 2,
    title: "Vopsit pereți + tavan cu pompă airless",
    description: "Aplicare mecanizată uniformă de vopsea specială lavabilă pe pereți și tavan, creând o barieră sanitară durabilă, rezistentă la umezeală și luminoasă.",
    image: null,
  },
  {
    orderNum: 3,
    title: "Refacere instalație electrică + iluminat",
    description: "Înlocuirea rețelei electrice improvizate cu trasee protejate în tub ignifug și montaj corpuri de iluminat LED ermetice, cu grad de protecție IP65.",
    image: null,
  },
  {
    orderNum: 4,
    title: "Dezafectare rețele existente",
    description: "Demontarea metodică și debitarea rețelelor vechi corodate, a vanelor blocate și a conductelor dezafectate care îngreunează circulația.",
    image: null,
  },
  {
    orderNum: 5,
    title: "Refacere trasee de ACM, ARM, agent termic, canalizare menajeră + pluvială",
    description: "Montaj conducte noi pe tije filetate și profile C: Apă Caldă Menajeră, Apă Rece Menajeră, agent termic cu izolație Armaflex și canalizare PVC etanșă.",
    image: "/ref-assets/pipes-DC20llBH.png",
  },
];

export const FAQS = [
  {
    q: "Este gratuită evaluarea tehnică a subsolului?",
    a: "Da, deplasarea inginerilor în teren, evaluarea detaliată a stării instalațiilor din subsol și întocmirea devizului de materiale sunt 100% gratuite pentru orice asociație din Ploiești.",
  },
  {
    q: "Asociația mai plătește ceva pentru materiale?",
    a: "Nu! Asociația plătește DOAR manopera (munca instalatorilor) către partenerul tehnic de execuție. Toate materialele (țevi, robineți, izolații, fitinguri) sunt sponsorizate gratuit de Asociația Viziune Urbană.",
  },
  {
    q: "Ce înseamnă sponsorizare în materiale?",
    a: "Viziune Urbană achiziționează direct de la distribuitori autorizați toate materialele din deviz și le livrează fizic la blocul dumneavoastră pe bază de proces-verbal de predare-primire și contract de sponsorizare.",
  },
  {
    q: "Cât durează procesul de la înscriere la începerea lucrărilor?",
    a: "În medie 2-3 săptămâni. În această perioadă se face evaluarea tehnică, se semnează acordul asociației (conform Legii 196/2018) și se livrează materialele necesare.",
  },
  {
    q: "Cine poate aplica pentru program?",
    a: "Orice asociație de proprietari legal constituită din municipiul Ploiești care se confruntă cu defecțiuni la rețeaua comună a subsolului și dorește reabilitarea pe baze transparente.",
  },
] as const;

// In-memory persistent state container for runtime
let requestsState: AuditRequest[] = [...INITIAL_ASSOCIATIONS];
let donationsState: DonationEntry[] = [];

export function getPublicAssociations(): PublicAssociationSummary[] {
  return requestsState.map((r) => ({
    id: r.id,
    building: r.building,
    address: r.address,
    status: r.status,
    formsCollected: r.formsCollected,
    formsTarget: r.formsTarget,
    fundsCollected: r.fundsCollected,
    fundsTarget: r.fundsTarget,
  }));
}

export function getAllAuditRequests(): readonly AuditRequest[] {
  return requestsState;
}

export function addAuditRequest(data: Omit<AuditRequest, "id" | "status" | "formsCollected" | "formsTarget" | "fundsCollected" | "fundsTarget" | "createdAt">): AuditRequest {
  const newReq: AuditRequest = {
    ...data,
    id: `req-${Date.now()}`,
    status: "nou",
    formsCollected: 0,
    formsTarget: 40,
    fundsCollected: 0,
    fundsTarget: 12000,
    createdAt: new Date().toISOString(),
  };
  requestsState = [newReq, ...requestsState];
  return newReq;
}

export function updateAuditRequestStatus(id: string, status: AuditRequest["status"]): boolean {
  const index = requestsState.findIndex((r) => r.id === id);
  if (index === -1) return false;
  requestsState[index] = { ...requestsState[index], status };
  return true;
}

export function addDonation(data: Omit<DonationEntry, "id" | "status" | "createdAt">): DonationEntry {
  const newDonation: DonationEntry = {
    ...data,
    id: `don-${Date.now()}`,
    status: "inregistrat",
    createdAt: new Date().toISOString(),
  };
  donationsState = [newDonation, ...donationsState];
  return newDonation;
}

export function getDonations(): readonly DonationEntry[] {
  return donationsState;
}
