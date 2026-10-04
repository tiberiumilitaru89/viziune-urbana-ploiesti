"use client";

import React, { useState } from "react";
import { X, Heart, Building2, CheckCircle2, ArrowRight, Loader2, Copy, PackageCheck, Coins, FileText, Check, Award, Landmark } from "lucide-react";
import { z } from "zod";
import { INITIAL_ASSOCIATIONS } from "@/lib/data";

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
  // Main bifurcation: "sponsorizeaza" vs "donatie_financiara"
  const [mainTab, setMainTab] = useState<"sponsorizeaza" | "donatie_financiara">("sponsorizeaza");
  
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
    navigator.clipboard.writeText("RO49AAAA1B31007593840000");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#050914]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92dvh] overflow-y-auto bg-[#0a142f] border-2 border-amber-500/40 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 sm:py-8 space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-400">
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Sponsorizare Înregistrată Oficial!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed font-serif">
              Vă mulțumim pentru generozitate. Oferta dumneavoastră destinată asociației <strong className="text-amber-300">{targetAssociation}</strong> a fost înscrisă în Registrul Donatorilor. Un reprezentant vă va contacta pentru redactarea contractului de sponsorizare (conform Legii 32/1994, 100% deductibil).
            </p>
            <div className="pt-3 sm:pt-4">
              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-serif font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
              >
                Închide fereastra
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-400 uppercase tracking-widest mb-1.5 sm:mb-2">
              <Award className="w-4 h-4" />
              Susține Proiectul Civic
            </div>
            <h3 className="text-xl sm:text-3xl font-serif font-black text-white mb-2 tracking-tight">
              Susține Proiectul
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-5 sm:mb-6 font-serif">
              Alegeți modalitatea de implicare: sponsorizarea unei asociații înscrise (bani sau materiale) ori donație directă.
            </p>

            {/* Primary Bifurcation: Sponsorizeaza vs Donatie Financiara */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#050914] rounded-2xl border border-amber-900/40 mb-5 sm:mb-6">
              <button
                type="button"
                onClick={() => setMainTab("sponsorizeaza")}
                className={`py-2.5 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm font-serif font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-center ${
                  mainTab === "sponsorizeaza"
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-950/60"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <PackageCheck className="w-4 h-4 shrink-0" />
                <span>Sponsorizează Proiect</span>
              </button>
              <button
                type="button"
                onClick={() => setMainTab("donatie_financiara")}
                className={`py-2.5 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm font-serif font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-center ${
                  mainTab === "donatie_financiara"
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-950/60"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Coins className="w-4 h-4 shrink-0" />
                <span>Donație Financiară</span>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* BRANCH 1: SPONSORIZEAZA PROIECT */}
            {mainTab === "sponsorizeaza" && (
              <form onSubmit={handleSponsorshipSubmit} className="space-y-4">
                {/* 1. Association Selection */}
                <div>
                  <label className="block text-xs font-serif font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    Asociația Vizată (Înscrise în Proiect până în prezent) *
                  </label>
                  <select
                    value={targetAssociation}
                    onChange={(e) => setTargetAssociation(e.target.value)}
                    className="w-full px-4 py-3 sm:py-2.5 rounded-xl bg-[#050914] border border-amber-900/50 text-base sm:text-sm text-white focus:outline-none focus:border-amber-400 font-serif"
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
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sponsorizarea va fi direcționată punctual către asociația selectată.
                  </p>
                </div>

                {/* 2. Sub-Toggle: Bani vs Materiale */}
                <div>
                  <label className="block text-xs font-serif font-bold text-amber-300 mb-1.5">
                    Modalitate Sponsorizare *
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#050914] rounded-xl border border-amber-900/40">
                    <button
                      type="button"
                      onClick={() => setSponsorshipType("materiale")}
                      className={`py-2 text-xs font-serif font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        sponsorshipType === "materiale"
                          ? "bg-[#0e1838] text-amber-300 border border-amber-400/40 shadow-sm"
                          : "text-slate-400 hover:text-white"
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
                          ? "bg-[#0e1838] text-amber-300 border border-amber-400/40 shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      În Bani (Financiar)
                    </button>
                  </div>
                </div>

                {/* Material Inputs */}
                {sponsorshipType === "materiale" ? (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-[#050914]/70 border border-amber-900/30">
                    <div>
                      <label className="block text-xs font-serif font-bold text-slate-300 mb-1">
                        Tip Material Oferit *
                      </label>
                      <select
                        value={materialType}
                        onChange={(e) => setMaterialType(e.target.value)}
                        className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-[#0a142f] border border-amber-900/40 text-base sm:text-sm text-white focus:outline-none focus:border-amber-400"
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
                        <label className="block text-xs font-serif font-bold text-slate-300 mb-1">
                          Cantitate *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-[#0a142f] border border-amber-900/40 text-base sm:text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-serif font-bold text-slate-300 mb-1">
                          Unitate Măsură
                        </label>
                        <input
                          type="text"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          placeholder="metri liniari, buc"
                          className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-[#0a142f] border border-amber-900/40 text-base sm:text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Money Sponsorship Inputs */
                  <div className="space-y-3 p-3.5 rounded-2xl bg-[#050914]/70 border border-amber-900/30">
                    <div>
                      <label className="block text-xs font-serif font-bold text-slate-300 mb-1.5">
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
                                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-950/60"
                                : "bg-[#0a142f] text-slate-300 border border-amber-900/40 hover:bg-[#142352]"
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
                        className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-[#0a142f] border border-amber-900/40 text-base sm:text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-serif font-bold text-slate-300 mb-1">
                      Companie / Nume Sponsor *
                    </label>
                    <input
                      type="text"
                      value={companyOrName}
                      onChange={(e) => setCompanyOrName(e.target.value)}
                      placeholder="Ex: S.C. Partener S.R.L."
                      className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-base sm:text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-serif font-bold text-slate-300 mb-1">
                      Telefon Contact *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0722 000 000"
                      className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-base sm:text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-slate-300 mb-1">
                    Email Oficial (opțional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@companie.ro"
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-[#050914] border border-amber-900/40 text-base sm:text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-serif font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-950/60 transition-all disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
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
                <div className="p-5 rounded-2xl bg-[#050914] border border-amber-900/40 space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-400 uppercase tracking-wider">
                    <Landmark className="w-4 h-4" />
                    Cont Bancar Oficial al Asociației Civice
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 font-serif">
                    <div>
                      <span className="font-bold text-amber-300">Beneficiar:</span> Asociația Viziune Urbană Ploiești
                    </div>
                    <div>
                      <span className="font-bold text-amber-300">Banca:</span> Banca Comercială Română (BCR) Ploiești
                    </div>
                  </div>

                  <div>
                    <span className="font-serif font-bold text-slate-200 text-xs block mb-1">
                      Cod IBAN Oficial (RON):
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#0a142f] border border-amber-500/30 font-mono text-xs text-amber-300">
                      <span className="break-all sm:break-normal select-all">RO49 AAAA 1B31 0075 9384 0000</span>
                      <button
                        onClick={handleCopyIban}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-lg text-xs font-serif font-bold bg-[#050914] hover:bg-slate-800 text-amber-300 border border-amber-500/30 transition-colors w-full sm:w-auto shrink-0"
                      >
                        {copiedIban ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Copiat
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copiază
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 leading-relaxed bg-[#0a142f]/60 p-3 rounded-xl border border-amber-900/30">
                    Mențiune obligatorie la detalii transfer:{" "}
                    <strong className="text-slate-200">„Donație civică reabilitare subsoluri Ploiești”</strong>.
                  </div>
                </div>

                {/* Formular 230 ANAF card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0e1838] to-[#050914] border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-300 uppercase tracking-wider">
                    <FileText className="w-4 h-4" />
                    Redirecționează 3.5% din Impozit (Formular 230)
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-serif">
                    Dacă ești persoană fizică salariată în Ploiești, poți direcționa 3.5% din impozitul pe venit datorat statului fără să plătești nimic în plus. Fiecare formular strâns ajută la plata manoperei pentru blocurile înscrise.
                  </p>
                  <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    Datele asociației sunt înregistrate în Registrul Entităților de Cult / ONG la ANAF.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
