"use client";

import React, { useState } from "react";
import { X, Heart, CheckCircle2, ArrowRight, Loader2, Copy, Award } from "lucide-react";
import { z } from "zod";

const materialFormSchema = z.object({
  materialType: z.string().min(2, "Specificați materialul oferit"),
  quantity: z.number().min(1, "Introduceți o cantitate minimă"),
  unit: z.string().min(1, "Specificați unitatea (m, buc, ml)"),
  companyOrName: z.string().min(3, "Introduceți denumirea companiei sau a donatorului"),
  phone: z.string().regex(/^(\+4|)?(07[0-9]{8}|0244[0-9]{6})$/, "Introduceți un telefon valid"),
  email: z.string().email("Introduceți un email valid").optional().or(z.literal("")),
});

type DonationModalProps = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

export function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const [activeTab, setActiveTab] = useState<"materiale" | "bani">("materiale");
  const [selectedAmount, setSelectedAmount] = useState<number>(250);
  const [copiedIban, setCopiedIban] = useState(false);

  const [formData, setFormData] = useState({
    materialType: "Țevi PPR fibră compozită",
    quantity: 100,
    unit: "metri liniari",
    companyOrName: "",
    phone: "",
    email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyIban = () => {
    navigator.clipboard.writeText("RO49AAAA1B31007593840000");
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2500);
  };

  const handleSubmitMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parseResult = materialFormSchema.safeParse({
      ...formData,
      quantity: Number(formData.quantity),
    });

    if (!parseResult.success) {
      setErrorMessage(parseResult.error.errors[0]?.message || "Verificați datele completate.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "materiale",
          ...parseResult.data,
        }),
      });

      if (!res.ok) {
        throw new Error("A apărut o eroare la salvarea donației.");
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Eroare necunoscută.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0a142f] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-white">
              Vă Mulțumim pentru Generozitate!
            </h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed font-serif">
              Oferta dumneavoastră de sponsorizare a fost înregistrată. Secretariatul asociației vă va contacta pentru semnarea contractului de sponsorizare și stabilirea detaliilor de livrare pe șantier.
            </p>
            <div className="pt-4">
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
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-rose-400 uppercase tracking-widest mb-2">
              <Heart className="w-4 h-4" />
              Susține Reabilitarea Ploieștiului
            </div>
            <h3 className="font-serif text-2xl font-black text-white mb-2 tracking-tight">
              Sponsorizează Inițiativa
            </h3>

            {/* Toggle Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#050914] rounded-xl border border-amber-900/30 my-4">
              <button
                type="button"
                onClick={() => setActiveTab("materiale")}
                className={`py-2 text-xs font-serif font-bold rounded-lg transition-all ${
                  activeTab === "materiale"
                    ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-950/60"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Donează Materiale Tehnice
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("bani")}
                className={`py-2 text-xs font-serif font-bold rounded-lg transition-all ${
                  activeTab === "bani"
                    ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-950/60"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Donație Financiară (BCR)
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {activeTab === "materiale" ? (
              <form onSubmit={handleSubmitMaterial} className="space-y-4">
                <div>
                  <label className="block text-xs font-serif font-bold text-slate-300 mb-1">
                    Tip Material Oferit *
                  </label>
                  <select
                    value={formData.materialType}
                    onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#050914] border border-amber-900/40 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Țevi PPR fibră compozită">Țevi PPR cu inserție compozită</option>
                    <option value="Coloane scurgere PVC fonoabsorbante">Coloane scurgere PVC fonoabsorbante</option>
                    <option value="Robineți de trecere industriali">Robineți de trecere industriali (DN25 - DN50)</option>
                    <option value="Izolație elastomerică Armaflex">Izolație elastomerică tip Armaflex</option>
                    <option value="Vopsea lavabilă anti-igrasie & grund">Vopsea lavabilă anti-igrasie & grund</option>
                    <option value="Fitinguri și coturi zincate/alamă">Fitinguri și coturi alamă / PPR</option>
                    <option value="Alt material specific">Alt material specific</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-serif font-bold text-slate-300 mb-1">
                      Cantitate *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#050914] border border-amber-900/40 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-serif font-bold text-slate-300 mb-1">
                      Unitate Măsură
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="Ex: metri, bucăți, găleți"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#050914] border border-amber-900/40 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-serif font-bold text-slate-300 mb-1">
                      Companie / Nume Donator *
                    </label>
                    <input
                      type="text"
                      value={formData.companyOrName}
                      onChange={(e) => setFormData({ ...formData, companyOrName: e.target.value })}
                      placeholder="Ex: S.C. Distribuitor S.R.L."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#050914] border border-amber-900/40 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-serif font-bold text-slate-300 mb-1">
                      Telefon Contact *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0722 000 000"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#050914] border border-amber-900/40 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-serif font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-xl shadow-amber-950/60 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Se procesează...
                    </>
                  ) : (
                    <>
                      Înregistrează Sponsorizarea <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-serif font-bold text-slate-300 mb-2">
                    Alegeți valoarea donației (Lei)
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[50, 100, 250, 500, 1000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSelectedAmount(val)}
                        className={`py-2 rounded-xl text-xs font-serif font-black transition-all ${
                          selectedAmount === val
                            ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/60"
                            : "bg-[#050914] text-slate-300 border border-amber-900/40 hover:border-amber-500/40"
                        }`}
                      >
                        {val} Lei
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#050914] border border-amber-900/30 space-y-3">
                  <div className="text-xs text-slate-400">
                    <span className="font-serif font-bold text-slate-200 block mb-0.5">Beneficiar:</span>
                    Asociația Viziune Urbană Ploiești
                  </div>
                  <div className="text-xs text-slate-400">
                    <span className="font-serif font-bold text-slate-200 block mb-0.5">Banca:</span>
                    Banca Comercială Română (BCR) Ploiești
                  </div>
                  <div>
                    <span className="font-serif font-bold text-slate-200 text-xs block mb-1">
                      Cod IBAN Oficial:
                    </span>
                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#0a142f] border border-amber-900/40 font-mono text-xs text-amber-300">
                      <span>RO49 AAAA 1B31 0075 9384 0000</span>
                      <button
                        onClick={handleCopyIban}
                        className="p-1 rounded text-slate-400 hover:text-white"
                        title="Copiază IBAN"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {copiedIban && (
                      <p className="text-[10px] text-amber-400 mt-1 font-semibold">
                        IBAN copiat în clipboard!
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed bg-[#050914]/60 p-3 rounded-xl border border-amber-900/30">
                  La detaliile plății menționați: <em>„Donație reabilitare subsoluri Ploiești”</em>.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
