"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ShieldCheck, Award, CalendarCheck, CheckCircle, Users, X, Loader2 } from "lucide-react";

export function TechnicalPartnerSection() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    companyName: "",
    phone: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<"companyName" | "phone" | "description", string>>>({});

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};
    if (!partnerForm.companyName.trim()) {
      errors.companyName = "Numele firmei este obligatoriu.";
    }
    if (!partnerForm.phone.trim()) {
      errors.phone = "Numărul de telefon este obligatoriu.";
    }
    if (!partnerForm.description.trim()) {
      errors.description = "Scurta descriere este obligatorie.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/partner-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partnerForm),
      });

      if (res.ok) {
        setIsSuccess(true);
        setPartnerForm({ companyName: "", phone: "", description: "" });
      } else {
        alert("A apărut o problemă la trimiterea solicitării. Vă rugăm să reîncercați.");
      }
    } catch {
      alert("Eroare de conexiune la trimiterea solicitării.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="partener" className="py-20 lg:py-24 bg-transparent border-t border-amber-900/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Visual Column */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-amber-900/15 shadow-xl bg-white aspect-[4/3]">
              <Image
                src="/tehnician-tevi-cupru.jpg"
                alt="Tehnician profesionist partener montând instalație"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Text & Guarantee Details */}
          <div>
            {/* Official Partner Brand & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-amber-900/20 shadow-md shrink-0 w-fit">
                <Image
                  src="/becheanu-logo.png"
                  alt="Sigla Oficială Instal Serv Becheanu"
                  width={220}
                  height={90}
                  className="h-16 sm:h-20 w-auto object-contain"
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EDE1] border border-amber-700/30 text-amber-900 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  Partener Tehnic Oficial
                </div>
                <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#071330] tracking-tight leading-tight">
                  INSTAL SERV BECHEANU
                </h2>
              </div>
            </div>

            <p className="text-slate-700 text-base leading-relaxed mb-8">
              Cu o experiență de peste 15 ani în domeniul instalațiilor de bloc din Ploiești și județul Prahova, echipa <strong className="text-[#071330] font-bold">Instal Serv Becheanu</strong> aduce expertiză industrială, scule profesionale și proceduri certificate pe fiecare șantier.
            </p>

            {/* Highlights in crisp white cards */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/85 backdrop-blur-md border border-amber-900/15 shadow-sm">
                <Award className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#071330] mb-0.5">
                    15+ Ani de Experiență Dedicată Blocurilor
                  </h4>
                  <p className="text-xs text-slate-600">
                    Sute de coloane înlocuite și subsoluri modernizate conform celor mai exigente standarde europene.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/85 backdrop-blur-md border border-amber-900/15 shadow-sm">
                <CalendarCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#071330] mb-0.5">
                    Garanție 5 Ani
                  </h4>
                  <p className="text-xs text-slate-600">
                    Garanție de 5 ani oferită de către partenerii de execuție prin contract și proces-verbal de recepție.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/85 backdrop-blur-md border border-amber-900/15 shadow-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#071330] mb-0.5">
                    Echipă Completă de Instalatori Autorizați
                  </h4>
                  <p className="text-xs text-slate-600">
                    Personal calificat cu vasta experienta in domeniul termic si sanitar.
                  </p>
                </div>
              </div>
            </div>

            {/* Acțiuni Rapide Partener & Contact Tehnic */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={`https://wa.me/40720015592?text=${encodeURIComponent(
                  "Bună ziua domnule George Becheanu! Vă contactez de pe site-ul Viziune Urbană Ploiești pentru o evaluare a instalațiilor din subsolul blocului nostru."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-serif font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                {/* WhatsApp SVG Icon */}
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp Direct Coordonator</span>
              </a>

              <button
                type="button"
                onClick={() => setIsPartnerModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-serif font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <Users className="w-4 h-4" />
                <span>Devino partener</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Dialog Devino Partener Tehnic */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#FAF7F2] rounded-2xl sm:rounded-3xl shadow-2xl border border-amber-900/20 text-slate-900 p-5 sm:p-8">
            <button
              onClick={() => {
                setIsPartnerModalOpen(false);
                setIsSuccess(false);
                setFormErrors({});
              }}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full hover:bg-black/5 text-slate-500 hover:text-slate-800 transition-colors"
              aria-label="Închide fereastra"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif font-black text-[#071330]">
                  Solicitare Trimisă cu Succes!
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                  Mulțumim pentru interesul acordat parteneriatului tehnic. Echipa de administrare a asociației a primit datele firmei dumneavoastră și vă va contacta în cel mai scurt timp.
                </p>
                <button
                  onClick={() => {
                    setIsPartnerModalOpen(false);
                    setIsSuccess(false);
                  }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-serif font-bold text-sm shadow-sm transition-all"
                >
                  Închide
                </button>
              </div>
            ) : (
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EDE1] border border-amber-700/30 text-amber-900 text-[11px] font-serif font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Alătură-te rețelei tehnice
                </div>
                <h3 className="text-2xl font-serif font-black text-[#071330] mb-2">
                  Devino Partener Tehnic
                </h3>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                  Completați formularul de mai jos. Administratorul asociației va fi notificat pentru a vă contacta în vederea colaborării pe șantierele de reabilitare din Ploiești.
                </p>

                <form onSubmit={handlePartnerSubmit} className="space-y-4 text-xs font-serif">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">
                      Numele firmei *
                    </label>
                    <input
                      type="text"
                      required
                      value={partnerForm.companyName}
                      onChange={(e) => {
                        setPartnerForm({ ...partnerForm, companyName: e.target.value });
                        if (formErrors.companyName) setFormErrors({ ...formErrors, companyName: undefined });
                      }}
                      placeholder="Ex: SC Instal Termic SRL"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-900/25 text-slate-900 text-xs shadow-sm focus:outline-none focus:border-amber-600"
                    />
                    {formErrors.companyName && (
                      <span className="text-[11px] text-rose-600 font-sans mt-1 block">
                        {formErrors.companyName}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">
                      Număr de telefon *
                    </label>
                    <input
                      type="tel"
                      required
                      value={partnerForm.phone}
                      onChange={(e) => {
                        setPartnerForm({ ...partnerForm, phone: e.target.value });
                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined });
                      }}
                      placeholder="Ex: 0722 123 456 sau 0244 123 456"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-900/25 text-slate-900 text-xs shadow-sm focus:outline-none focus:border-amber-600"
                    />
                    {formErrors.phone && (
                      <span className="text-[11px] text-rose-600 font-sans mt-1 block">
                        {formErrors.phone}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">
                      Scurtă descriere a activității *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={partnerForm.description}
                      onChange={(e) => {
                        setPartnerForm({ ...partnerForm, description: e.target.value });
                        if (formErrors.description) setFormErrors({ ...formErrors, description: undefined });
                      }}
                      placeholder="Ex: Firmă autorizată de instalații termice și sanitare, experiență în coloane și subsoluri de bloc..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-900/25 text-slate-900 text-xs shadow-sm focus:outline-none focus:border-amber-600"
                    />
                    {formErrors.description && (
                      <span className="text-[11px] text-rose-600 font-sans mt-1 block">
                        {formErrors.description}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPartnerModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-serif text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Renunță
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-serif font-bold text-xs shadow-md transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Se trimite...</span>
                        </>
                      ) : (
                        <span>Trimite Solicitarea</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
