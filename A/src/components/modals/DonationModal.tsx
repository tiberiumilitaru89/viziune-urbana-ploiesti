"use client";

import React, { useState } from "react";
import { X, Heart, Building2, CheckCircle2, ArrowRight, Loader2, Copy, PackageCheck, Coins, FileText, Check, Award, Landmark } from "lucide-react";
import { z } from "zod";
import { INITIAL_ASSOCIATIONS } from "@/lib/data";

import Link from "next/link";
import { Formular230Wizard } from "@/components/form230/Formular230Wizard";

const sponsorshipSchema = z.object({
  sponsorshipMode: z.enum(["materiale", "bani"]),
  targetAssociationName: z.string().min(2, "Selectați asociația vizată"),
  // Material fields
  materialType: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  // Money fields
  amountRon: z.number().optional(),
  // Contact
  companyOrName: z.string().min(3, "Introduceți denumirea companiei sau a sponsorului"),
  phone: z.string().regex(/^(\+4|)?(07[0-9]{8}|0244[0-9]{6})$/, "Introduceți un telefon valid"),
  email: z.string().email("Introduceți un email valid").optional().or(z.literal("")),
});

type DonationModalProps = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

export function DonationModal({ isOpen, onClose }: DonationModalProps) {
  // Main bifurcation: "sponsorizeaza" vs "donatie_financiara" vs "formular_230"
  const [mainTab, setMainTab] = useState<"sponsorizeaza" | "donatie_financiara" | "formular_230">("sponsorizeaza");
  
  // Sub-bifurcation for sponsorship: "materiale" vs "bani"
  const [sponsorshipType, setSponsorshipType] = useState<"materiale" | "bani">("materiale");
  
  const [targetAssociation, setTargetAssociation] = useState<string>("Fondul General de Reabilitare (Alocare Prioritară)");
  const [copiedIban, setCopiedIban] = useState(false);

  // Form states
  const [materialType, setMaterialType] = useState("Țevi PPR fibră compozită");
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState("metri liniari");
  const [moneyAmount, setMoneyAmount] = useState<number>(1000);
  const [companyOrName, setCompanyOrName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyIban = () => {
    navigator.clipboard.writeText("RO94BACX0000004234473000");
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2500);
  };

  const handleSponsorshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload = {
      sponsorshipMode: sponsorshipType,
      targetAssociationName: targetAssociation,
      materialType: sponsorshipType === "materiale" ? materialType : undefined,
      quantity: sponsorshipType === "materiale" ? Number(quantity) : undefined,
      unit: sponsorshipType === "materiale" ? unit : undefined,
      amountRon: sponsorshipType === "bani" ? Number(moneyAmount) : undefined,
      companyOrName,
      phone,
      email,
    };

    const parseResult = sponsorshipSchema.safeParse(payload);
    if (!parseResult.success) {
      setErrorMessage(parseResult.error.errors[0]?.message || "Verificați datele completate.");
      return;
    }

    if (sponsorshipType === "materiale" && (!quantity || quantity <= 0)) {
      setErrorMessage("Introduceți o cantitate validă de materiale.");
      return;
    }

    if (sponsorshipType === "bani" && (!moneyAmount || moneyAmount <= 0)) {
      setErrorMessage("Introduceți o sumă validă.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: sponsorshipType,
          targetAssociationName: targetAssociation,
          amountRon: sponsorshipType === "bani" ? Number(moneyAmount) : undefined,
          materialType: sponsorshipType === "materiale" ? materialType : undefined,
          quantity: sponsorshipType === "materiale" ? Number(quantity) : undefined,
          unit: sponsorshipType === "materiale" ? unit : undefined,
          companyOrName,
          phone,
          email,
        }),
      });

      if (!res.ok) {
        throw new Error("A apărut o eroare la salvarea sponsorizării.");
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Eroare necunoscută.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92dvh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-amber-900/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl text-slate-900">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-slate-500 hover:text-slate-950 hover:bg-amber-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 sm:py-8 space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#071330]">
              Sponsorizare Înregistrată Oficial!
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 max-w-md mx-auto leading-relaxed font-serif">
              Vă mulțumim pentru generozitate. Oferta dumneavoastră destinată asociației <strong className="text-amber-800">{targetAssociation}</strong> a fost înscrisă în Registrul Donatorilor. Un reprezentant vă va contacta pentru redactarea contractului de sponsorizare (conform Legii 32/1994, 100% deductibil).
            </p>
            <div className="pt-3 sm:pt-4">
              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-serif font-bold text-white bg-[#c48834] hover:bg-amber-600 transition-colors shadow-md"
              >
                Închide fereastra
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-900 uppercase tracking-widest mb-1.5 sm:mb-2">
              <Award className="w-4 h-4 text-amber-700" />
              Susține Proiectul Civic
            </div>
            <h3 className="text-xl sm:text-3xl font-serif font-black text-[#071330] mb-2 tracking-tight">
              Susține Proiectul
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-5 sm:mb-6 font-serif">
              Alegeți modalitatea de implicare: sponsorizarea unei asociații înscrise (bani sau materiale) ori donație directă.
            </p>

            {/* Primary Bifurcation: Sponsorizeaza vs Donatie Financiara vs Formular 230 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-[#FAF7F2] rounded-2xl border border-amber-900/20 mb-5 sm:mb-6">
              <button
                type="button"
                onClick={() => setMainTab("sponsorizeaza")}
                className={`py-2.5 px-2 text-xs font-serif font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-center ${
                  mainTab === "sponsorizeaza"
                    ? "bg-[#c48834] text-white shadow-md font-bold"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                <PackageCheck className="w-4 h-4 shrink-0" />
                <span>Sponsorizează</span>
              </button>
              <button
                type="button"
                onClick={() => setMainTab("donatie_financiara")}
                className={`py-2.5 px-2 text-xs font-serif font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-center ${
                  mainTab === "donatie_financiara"
                    ? "bg-[#c48834] text-white shadow-md font-bold"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                <Coins className="w-4 h-4 shrink-0" />
                <span>Cont Bancar</span>
              </button>
              <button
                type="button"
                onClick={() => setMainTab("formular_230")}
                className={`py-2.5 px-2 text-xs font-serif font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-center ${
                  mainTab === "formular_230"
                    ? "bg-[#c48834] text-white shadow-md font-bold"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Formular 230 (3,5%)</span>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* BRANCH 1: SPONSORIZEAZA PROIECT */}
            {mainTab === "sponsorizeaza" && (
              <form onSubmit={handleSponsorshipSubmit} className="space-y-4">
                {/* 1. Association Selection */}
                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-700" />
                    Asociația Vizată (Înscrise în Proiect până în prezent) *
                  </label>
                  <select
                    value={targetAssociation}
                    onChange={(e) => setTargetAssociation(e.target.value)}
                    className="w-full px-4 py-3 sm:py-2.5 rounded-xl bg-white border border-amber-900/25 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-amber-600 font-serif shadow-sm"
                  >
                    <option value="Fondul General de Reabilitare (Alocare Prioritară)">
                      🌟 Fondul General de Reabilitare (Alocare prioritară municipiu)
                    </option>
                    {INITIAL_ASSOCIATIONS.map((assoc) => (
                      <option key={assoc.id} value={`${assoc.building} — ${assoc.address}`}>
                        🏢 {assoc.building} ({assoc.address})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Sponsorizarea va fi direcționată punctual către asociația selectată.
                  </p>
                </div>

                {/* 2. Sub-Toggle: Bani vs Materiale */}
                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1.5">
                    Modalitate Sponsorizare *
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF7F2] rounded-xl border border-amber-900/20">
                    <button
                      type="button"
                      onClick={() => setSponsorshipType("materiale")}
                      className={`py-2 text-xs font-serif font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        sponsorshipType === "materiale"
                          ? "bg-white text-amber-900 border border-amber-600/40 shadow-sm"
                          : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      În Materiale Tehnice
                    </button>
                    <button
                      type="button"
                      onClick={() => setSponsorshipType("bani")}
                      className={`py-2 text-xs font-serif font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        sponsorshipType === "bani"
                          ? "bg-white text-amber-900 border border-amber-600/40 shadow-sm"
                          : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      În Bani (Financiar)
                    </button>
                  </div>
                </div>

                {/* Material Inputs */}
                {sponsorshipType === "materiale" ? (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-[#FAF7F2] border border-amber-900/15">
                    <div>
                      <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                        Tip Material Oferit *
                      </label>
                      <select
                        value={materialType}
                        onChange={(e) => setMaterialType(e.target.value)}
                        className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-white border border-amber-900/25 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-amber-600 shadow-sm"
                      >
                        <option value="Țevi PPR fibră compozită">Țevi PPR cu inserție compozită</option>
                        <option value="Coloane scurgere PVC fonoabsorbante">Coloane scurgere PVC fonoabsorbante</option>
                        <option value="Robineți de trecere industriali">Robineți de trecere industriali (DN25 - DN50)</option>
                        <option value="Izolație elastomerică Armaflex">Izolație elastomerică tip Armaflex</option>
                        <option value="Vopsea lavabilă anti-igrasie & grund">Vopsea lavabilă anti-igrasie & grund</option>
                        <option value="Fitinguri și coturi zincate/alamă">Fitinguri și coturi alamă / PPR</option>
                        <option value="Alt material specific">Alt material specific conform caiet de sarcini</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                          Cantitate *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-white border border-amber-900/25 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-amber-600 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                          Unitate Măsură
                        </label>
                        <input
                          type="text"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          placeholder="metri liniari, buc"
                          className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-white border border-amber-900/25 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-amber-600 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Money Sponsorship Inputs */
                  <div className="space-y-3 p-3.5 rounded-2xl bg-[#FAF7F2] border border-amber-900/15">
                    <div>
                      <label className="block text-xs font-serif font-bold text-slate-700 mb-1.5">
                        Valoare Sponsorizare Dedicată (Lei) *
                      </label>
                      <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 mb-2">
                        {[500, 1000, 2500, 5000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setMoneyAmount(amt)}
                            className={`py-2 sm:py-1.5 rounded-lg text-xs font-serif font-bold transition-all ${
                              moneyAmount === amt
                                ? "bg-[#c48834] text-white shadow-md font-bold"
                                : "bg-white text-slate-800 border border-amber-900/20 hover:bg-amber-50"
                            }`}
                          >
                            {amt} Lei
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        min="50"
                        value={moneyAmount}
                        onChange={(e) => setMoneyAmount(Number(e.target.value))}
                        placeholder="Altă sumă (Lei)"
                        className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-white border border-amber-900/25 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-amber-600 shadow-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                      Companie / Nume Sponsor *
                    </label>
                    <input
                      type="text"
                      value={companyOrName}
                      onChange={(e) => setCompanyOrName(e.target.value)}
                      placeholder="Ex: S.C. Partener S.R.L."
                      className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-white border border-amber-900/25 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-amber-600 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                      Telefon Contact *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0722 000 000"
                      className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-white border border-amber-900/25 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-amber-600 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Email Oficial (opțional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@companie.ro"
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-white border border-amber-900/25 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-amber-600 shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-serif font-bold text-white bg-[#c48834] hover:bg-amber-600 shadow-md transition-all disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Se transmite solicitarea...
                    </>
                  ) : (
                    <>
                      Înregistrează Sponsorizarea <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* BRANCH 2: DONATIE FINANCIARA */}
            {mainTab === "donatie_financiara" && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white/90 border border-amber-900/20 shadow-sm space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-900 uppercase tracking-wider">
                    <Landmark className="w-4 h-4 text-amber-700" />
                    Cont Bancar Oficial al Asociației Civice
                  </div>

                  <div className="text-xs text-slate-700 space-y-1 font-serif">
                    <div>
                      <span className="font-bold text-[#071330]">Beneficiar:</span> Asociația Viziune Urbană Ploiești
                    </div>
                    <div>
                      <span className="font-bold text-[#071330]">Banca:</span> UniCredit Bank
                    </div>
                  </div>

                  <div>
                    <span className="font-serif font-bold text-slate-800 text-xs block mb-1">
                      Cod IBAN Oficial (RON):
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#FAF7F2] border border-amber-900/20 font-mono text-xs text-amber-950 font-bold">
                      <span className="break-all sm:break-normal select-all">RO94 BACX 0000 0042 3447 3000</span>
                      <button
                        onClick={handleCopyIban}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-lg text-xs font-serif font-bold bg-white hover:bg-amber-50 text-amber-900 border border-amber-900/25 transition-colors w-full sm:w-auto shrink-0 shadow-sm"
                      >
                        {copiedIban ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Copiat
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-amber-800" />
                            Copiază
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-700 leading-relaxed bg-[#FAF7F2] p-3 rounded-xl border border-amber-900/15">
                    Mențiune obligatorie la detalii transfer:{" "}
                    <strong className="text-[#071330]">„Donație civică reabilitare subsoluri Ploiești”</strong>.
                  </div>
                </div>

                {/* Formular 230 ANAF card */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-amber-600/30 space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-900 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-amber-700" />
                    Redirecționează 3.5% din Impozit (Formular 230)
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-serif">
                    Dacă ești persoană fizică salariată în Ploiești, poți direcționa 3.5% din impozitul pe venit datorat statului fără să plătești nimic în plus. Fiecare formular strâns ajută la plata manoperei pentru blocurile înscrise.
                  </p>
                  <div className="text-[11px] text-amber-900 font-semibold flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Datele asociației sunt înregistrate în Registrul Entităților de Cult / ONG la ANAF.
                  </div>

                  <button
                    type="button"
                    onClick={() => setMainTab("formular_230")}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98]"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Completează Formularul 230 Online</span>
                  </button>
                </div>
              </div>
            )}

            {/* BRANCH 3: FORMULARUL 230 ONLINE */}
            {mainTab === "formular_230" && (
              <div className="pt-1">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#FAF7F2] border border-amber-900/15">
                  <span className="text-[11px] text-slate-700 font-serif">
                    Completează și semnează direct aici sau deschide pagina dedicată:
                  </span>
                  <Link
                    href="/formular-230"
                    onClick={onClose}
                    className="text-xs font-serif font-bold text-amber-900 underline hover:text-amber-700 shrink-0"
                  >
                    Deschide pagină separată ↗
                  </Link>
                </div>
                <Formular230Wizard isEmbeddedInModal onCompleted={() => setIsSuccess(true)} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
