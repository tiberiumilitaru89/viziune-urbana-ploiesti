import { AuditRequest, ProjectItem, SpecItem, DonationEntry, PublicAssociationSummary, PartnerItem, GlobalMetrics, Formular230Entry, OngConfig, Formular230Status } from "./types";

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
    a: "Nu! Asociația plătește DOAR manopera catre partenerii tehinici de executie . Toate materialele (țevi, robineți, izolații, fitinguri, etc.) sunt sponsorizate gratuit de Asociația Viziune Urbana Ploiesti.",
  },
  {
    q: "Ce înseamnă sponsorizare în materiale?",
    a: "Viziune Urbană Ploiești achiziționează direct de la distribuitori autorizați toate materialele din deviz și le livrează fizic la blocul dumneavoastră pe bază de proces-verbal de predare-primire și contract de sponsorizare.",
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

export const INITIAL_PARTNERS: readonly PartnerItem[] = [
  {
    id: "part-1",
    name: "Instal Serv Becheanu",
    role: "Partener Tehnic de Execuție",
    category: "executie",
    description: "Firmă autorizată cu peste 15 ani de experiență în rețele hidraulice și termoficare de bloc în Ploiești. Echipă certificată și garanție contractuală.",
    logoUrl: "/becheanu-logo.png",
    badgeText: "Partener Oficial",
  },
  {
    id: "part-2",
    name: "Liceul Tehnologic „Toma Socolescu” Ploiești",
    role: "Partener de Practică Profesională",
    category: "practica",
    description: "Elevii din clasele profesionale de instalații participă la stagii practice pe șantierele de reabilitare sub îndrumarea maiștrilor și tehnicienilor Instal Serv Becheanu.",
    badgeText: "Educațional",
  },
  {
    id: "part-3",
    name: "InfoACCRP",
    role: "Partener de Calificare & Formare Profesională",
    category: "practica",
    description: "Centrul de calificare și recalificare profesională asigură instruirea practică, atestarea oficială și perfecționarea continuă a instalatorilor și partenerilor tehnici autorizați pe șantierele de modernizare.",
    badgeText: "Calificare Tehnică",
  },
  {
    id: "part-4",
    name: "Universitatea Petrol-Gaze (UPG) Ploiești",
    role: "Partener Academic & Tehnologic",
    category: "academic",
    description: "Expertiză tehnică, monitorizare a eficienței energetice și susținere științifică a programului de modernizare a infrastructurii municipale.",
    badgeText: "Academic",
  },
];

export const INITIAL_METRICS: GlobalMetrics = {
  totalFormsCollected: 95,
  totalFormsTarget: 130,
  totalFundsCollectedRon: 25700,
  totalFundsTargetRon: 40500,
  activeAssociationsCount: 3,
};

let requestsState: AuditRequest[] = [...INITIAL_ASSOCIATIONS];
let projectsState: ProjectItem[] = [...INITIAL_PROJECTS];
let partnersState: PartnerItem[] = [...INITIAL_PARTNERS];
let metricsState: GlobalMetrics = { ...INITIAL_METRICS };
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

export function addAuditRequest(data: Omit<AuditRequest, "id" | "status" | "formsCollected" | "formsTarget" | "fundsCollected" | "fundsTarget" | "createdAt"> & {
  formsCollected?: number;
  formsTarget?: number;
  fundsCollected?: number;
  fundsTarget?: number;
  status?: AuditRequest["status"];
}): AuditRequest {
  const newReq: AuditRequest = {
    ...data,
    id: `req-${Date.now()}`,
    status: data.status ?? "nou",
    formsCollected: data.formsCollected ?? 0,
    formsTarget: data.formsTarget ?? 40,
    fundsCollected: data.fundsCollected ?? 0,
    fundsTarget: data.fundsTarget ?? 12000,
    createdAt: new Date().toISOString(),
  };
  requestsState = [newReq, ...requestsState];
  metricsState = {
    ...metricsState,
    activeAssociationsCount: requestsState.length,
  };
  return newReq;
}

export function updateAuditRequest(
  id: string,
  updates: Partial<Pick<AuditRequest, "status" | "formsCollected" | "formsTarget" | "fundsCollected" | "fundsTarget" | "building" | "address" | "problem" | "name" | "phone">>
): boolean {
  const index = requestsState.findIndex((r) => r.id === id);
  if (index === -1) return false;
  requestsState[index] = { ...requestsState[index], ...updates };
  return true;
}

export function updateAuditRequestStatus(id: string, status: AuditRequest["status"]): boolean {
  return updateAuditRequest(id, { status });
}

export function getAllProjects(): readonly ProjectItem[] {
  return projectsState;
}

export function addProject(item: Omit<ProjectItem, "id">): ProjectItem {
  const newProj: ProjectItem = {
    ...item,
    id: `proj-${Date.now()}`,
  };
  projectsState = [newProj, ...projectsState];
  return newProj;
}

export function updateProject(id: string, updates: Partial<Omit<ProjectItem, "id">>): boolean {
  const index = projectsState.findIndex((p) => p.id === id);
  if (index === -1) return false;
  projectsState[index] = { ...projectsState[index], ...updates };
  return true;
}

export function getAllPartners(): readonly PartnerItem[] {
  return partnersState;
}

export function addPartner(item: Omit<PartnerItem, "id">): PartnerItem {
  const newPart: PartnerItem = {
    ...item,
    id: `part-${Date.now()}`,
  };
  partnersState = [...partnersState, newPart];
  return newPart;
}

export function updatePartner(id: string, updates: Partial<Omit<PartnerItem, "id">>): boolean {
  const index = partnersState.findIndex((p) => p.id === id);
  if (index === -1) return false;
  partnersState[index] = { ...partnersState[index], ...updates };
  return true;
}

export function getGlobalMetrics(): GlobalMetrics {
  return metricsState;
}

export function updateGlobalMetrics(updates: Partial<GlobalMetrics>): GlobalMetrics {
  metricsState = { ...metricsState, ...updates };
  return metricsState;
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

// Configurație oficială ONG pentru Formularul 230 (Editabilă din Panou Admin)
let ongConfigState: OngConfig = {
  name: "Asociația Viziune Urbană Ploiești",
  cif: "48923410", // CIF configurabil
  iban: "RO94BACX0000004234473000",
  bank: "UniCredit Bank România",
  percentage: "3,5%",
  distributeYears: 2,
};

export function getOngConfig(): OngConfig {
  return ongConfigState;
}

export function updateOngConfig(updates: Partial<OngConfig>): OngConfig {
  ongConfigState = { ...ongConfigState, ...updates };
  return ongConfigState;
}

// Stare Formulare 230 depuse
let formulare230State: Formular230Entry[] = [
  {
    id: "f230-1",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastName: "Radu",
    firstName: "Constantin",
    initialaTata: "I",
    cnp: "1850312297123",
    email: "c.radu@gmail.com",
    phone: "0723456789",
    address: "Str. Malu Roșu nr. 14, Bl. 32A, Sc. B, Ap. 24",
    city: "Ploiești",
    county: "Prahova",
    signatureDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='60'><path d='M10 40 Q 50 10 90 35 T 180 20' stroke='%23071330' stroke-width='2' fill='none'/></svg>",
    distributeFor2Years: true,
    consentBorderou: true,
    status: "validat",
  },
  {
    id: "f230-2",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastName: "Popescu",
    firstName: "Elena",
    initialaTata: "G",
    cnp: "2900714298456",
    email: "elena.popescu@yahoo.com",
    phone: "0731987654",
    address: "B-dul Republicii nr. 112, Bl. 14A, Sc. A, Ap. 12",
    city: "Ploiești",
    county: "Prahova",
    signatureDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='60'><path d='M15 30 Q 60 50 110 20 T 170 45' stroke='%23071330' stroke-width='2' fill='none'/></svg>",
    distributeFor2Years: true,
    consentBorderou: true,
    status: "inregistrat",
  },
];

export function getAllFormulare230(): readonly Formular230Entry[] {
  return formulare230State;
}

export function addFormular230(data: Omit<Formular230Entry, "id" | "createdAt" | "status">): Formular230Entry {
  const newEntry: Formular230Entry = {
    ...data,
    id: `f230-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "inregistrat",
  };
  formulare230State = [newEntry, ...formulare230State];
  return newEntry;
}

export function updateFormular230Status(id: string, status: Formular230Status): boolean {
  const index = formulare230State.findIndex((f) => f.id === id);
  if (index === -1) return false;
  formulare230State[index] = { ...formulare230State[index], status };
  return true;
}
