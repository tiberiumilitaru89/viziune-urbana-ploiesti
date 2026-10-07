"use client";

import React, { useState } from "react";
import { X, ShieldCheck, CheckCircle2, ArrowRight, Loader2, Award } from "lucide-react";
import { z } from "zod";

const auditFormSchema = z.object({
  name: z.string().min(3, "Numele trebuie să aibă minim 3 caractere"),
  phone: z.string().regex(/^(\+4|)?(07[0-9]{8}|0244[0-9]{6})$/, "Introduceți un număr de telefon valid (ex: 0722123456 sau 0244456789)"),
  building: z.string().min(3, "Introduceți denumirea asociației sau a blocului"),
  address: z.string().min(5, "Introduceți adresa completă din Ploiești"),
  problem: z.string().min(10, "Descrieți pe scurt problemele (minim 10 caractere)"),
});

type AuditFormData = z.infer<typeof auditFormSchema>;

type AuditModalProps = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

export function AuditModal({ isOpen, onClose }: AuditModalProps) {
  const [formData, setFormData] = useState<AuditFormData>({
    name: "",
    phone: "",
    building: "",
    address: "",
    problem: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AuditFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof AuditFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const result = auditFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof AuditFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof AuditFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/audit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "A apărut o eroare la trimiterea formularului.");
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Eroare necunoscută de conexiune.";
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-amber-900/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl text-slate-900">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-slate-950 hover:bg-amber-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#071330]">
              Cerere Înregistrată în Registru!
            </h3>
            <p className="text-sm text-slate-700 max-w-sm mx-auto leading-relaxed font-serif">
              Vă mulțumim. Un inginer evaluator din cadrul Asociației Viziune Urbană Ploiești și al Instal Serv Becheanu vă va contacta în termen de 24-48 de ore pentru stabilirea vizitei gratuite în teren.
            </p>
            <div className="pt-4">
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
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-900 uppercase tracking-widest mb-2">
              <Award className="w-4 h-4 text-amber-700" />
              Evaluare Gratuită în Teren
            </div>
            <h3 className="font-serif text-2xl font-black text-[#071330] mb-2 tracking-tight">
              Înscriere Asociație de Proprietari
            </h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Completați datele de mai jos. Deplasarea echipei tehnice și întocmirea devizului de materiale sunt 100% gratuite.
            </p>

            {serverError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                  Nume Persoană Contact *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Ion Popescu (Președinte / Administrator)"
                  className="w-full px-4 py-3 sm:py-2.5 rounded-xl bg-white border border-amber-900/25 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 shadow-sm transition-colors"
                />
                {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Număr Telefon *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0722 123 456"
                    className="w-full px-4 py-3 sm:py-2.5 rounded-xl bg-white border border-amber-900/25 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 shadow-sm transition-colors"
                  />
                  {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Asociație / Bloc *
                  </label>
                  <input
                    type="text"
                    name="building"
                    value={formData.building}
                    onChange={handleChange}
                    placeholder="Ex: Bloc 14A, Sc. B"
                    className="w-full px-4 py-3 sm:py-2.5 rounded-xl bg-white border border-amber-900/25 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 shadow-sm transition-colors"
                  />
                  {errors.building && <p className="text-[11px] text-rose-600 mt-1">{errors.building}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                  Adresă Completă în Ploiești *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Ex: Str. Malu Roșu nr. 12, Cartier Nord"
                  className="w-full px-4 py-3 sm:py-2.5 rounded-xl bg-white border border-amber-900/25 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 shadow-sm transition-colors"
                />
                {errors.address && <p className="text-[11px] text-rose-600 mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                  Descrierea Problemelor Subsolului *
                </label>
                <textarea
                  name="problem"
                  rows={3}
                  value={formData.problem}
                  onChange={handleChange}
                  placeholder="Ex: Coloană canalizare spartă, bălți de apă în subsol, țevi calde neizolate..."
                  className="w-full px-4 py-3 sm:py-2.5 rounded-xl bg-white border border-amber-900/25 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 shadow-sm transition-colors resize-none"
                />
                {errors.problem && <p className="text-[11px] text-rose-600 mt-1">{errors.problem}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-serif font-bold text-white bg-[#c48834] hover:bg-amber-600 shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Se trimite cererea...
                  </>
                ) : (
                  <>
                    Trimite Solicitarea de Evaluare <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
