export type AuditStatus = "nou" | "in_evaluare" | "acceptat" | "respins" | "finalizat";

export type AuditRequest = {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly building: string;
  readonly address: string;
  readonly problem: string;
  readonly status: AuditStatus;
  readonly formsCollected: number;
  readonly formsTarget: number;
  readonly fundsCollected: number;
  readonly fundsTarget: number;
  readonly createdAt: string;
};

export type PublicAssociationSummary = {
  readonly id: string;
  readonly building: string;
  readonly address: string;
  readonly status: AuditStatus;
  readonly formsCollected: number;
  readonly formsTarget: number;
  readonly fundsCollected: number;
  readonly fundsTarget: number;
};

export type ProjectItem = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: "in_curs" | "finalizat";
  readonly beforeImage: string;
  readonly afterImage: string;
  readonly completionDate: string;
};

export type SpecItem = {
  readonly orderNum: number;
  readonly title: string;
  readonly description: string;
  readonly image: string | null;
};

export type DonationEntry = {
  readonly id: string;
  readonly type: "bani" | "materiale";
  readonly targetAssociationName?: string;
  readonly amountRon?: number;
  readonly materialType?: string;
  readonly quantity?: number;
  readonly unit?: string;
  readonly companyOrName: string;
  readonly phone: string;
  readonly email?: string;
  readonly description?: string;
  readonly status: "inregistrat" | "confirmat" | "finalizat";
  readonly createdAt: string;
};

export type PartnerCategory = "executie" | "practica" | "comunitate" | "academic";

export type PartnerItem = {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly category: PartnerCategory;
  readonly description: string;
  readonly logoUrl?: string;
  readonly website?: string;
  readonly badgeText?: string;
};

export type GlobalMetrics = {
  readonly totalFormsCollected: number;
  readonly totalFormsTarget: number;
  readonly totalFundsCollectedRon: number;
  readonly totalFundsTargetRon: number;
  readonly activeAssociationsCount: number;
};

export type OngConfig = {
  name: string;
  cif: string;
  iban: string;
  bank: string;
  percentage: string;
  distributeYears: number;
};

export type Formular230Status = "inregistrat" | "validat" | "depus_anaf";

export type Formular230Entry = {
  readonly id: string;
  readonly createdAt: string;
  readonly lastName: string; // Nume
  readonly firstName: string; // Prenume
  readonly initialaTata?: string;
  readonly cnp: string;
  readonly email: string;
  readonly phone: string;
  readonly address: string;
  readonly city: string;
  readonly county: string;
  readonly signatureDataUrl: string; // Base64 PNG signature
  readonly distributeFor2Years: boolean;
  readonly consentBorderou: boolean;
  readonly status: Formular230Status;
};
