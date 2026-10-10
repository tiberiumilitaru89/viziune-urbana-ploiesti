"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SignatureCanvas } from "./SignatureCanvas";
import { Formular230OfficialDoc } from "./Formular230OfficialDoc";
import { OngConfig } from "@/lib/types";
import { fetchPublicDataClient } from "@/lib/publicData";
import { validateRomanianCnp } from "@/lib/cnp";
import { Shield, CheckCircle2, ArrowRight, ArrowLeft, Send, AlertCircle } from "lucide-react";

type Formular230WizardProps = {
  readonly onCompleted?: () => void;
  readonly isEmbeddedInModal?: boolean;
};

export function Formular230Wizard({ onCompleted, isEmbeddedInModal: _isEmbeddedInModal }: Formular230WizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [ongConfig, setOngConfig] = useState<OngConfig>({
    name: "Asociația Viziune Urbană Ploiești",
    cif: "48923410",
    iban: "RO94BACX0000004234473000",
    bank: "UniCredit Bank România",
    percentage: "3,5%",
    distributeYears: 2,
  });

  // Form Fields
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [initialaTata, setInitialaTata] = useState("");
  const [cnp, setCnp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Ploiești");
  const [county, setCounty] = useState("Prahova");
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [distributeFor2Years, setDistributeFor2Years] = useState(true);
  const [consentBorderou, setConsentBorderou] = useState(true);
  const [consentGdpr, setConsentGdpr] = useState(true);
  const [hpWebsite, setHpWebsite] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch actual config from safe public endpoint
  useEffect(() => {
    async function loadConfig() {
      try {
        const bundle = await fetchPublicDataClient();
        if (bundle.ongConfig) {
          setOngConfig(bundle.ongConfig);
        }
      } catch (err) {
        console.error("Eroare încărcare configurație ONG:", err);
      }
    }
    loadConfig();
  }, []);

  const validateStep1 = () => {
    setErrorMessage(null);
    if (!lastName.trim() || !firstName.trim()) {
      setErrorMessage("Vă rugăm să introduceți numele și prenumele complete.");
      return false;
    }
    const cleanCnp = cnp.trim();
    const cnpCheck = validateRomanianCnp(cleanCnp);
    if (!cnpCheck.isValid) {
      setErrorMessage(cnpCheck.error || "CNP-ul introdus este invalid.");
      return false;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMessage("Vă rugăm să introduceți un număr de telefon valid.");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Vă rugăm să introduceți o adresă de email validă.");
      return false;
    }
    if (!address.trim() || address.trim().length < 5) {
      setErrorMessage("Vă rugăm să introduceți adresa completă (stradă, bloc, număr, apartament).");
      return false;
    }
    return true;
  };

  const handleNextToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleNextToStep3 = () => {
    setErrorMessage(null);
    if (!signatureDataUrl) {
      setErrorMessage("Vă rugăm să semnați formularul în căsuța de mai jos înainte de a continua.");
      return;
    }
    if (!consentGdpr) {
      setErrorMessage("Pentru a continua este necesar acordul dumneavoastră privind prelucrarea datelor cu caracter personal conform Politicii de Confidențialitate.");
      return;
    }
    setStep(3);
  };

  const handleSubmitToAssociation = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        lastName,
        firstName,
        initialaTata: initialaTata.toUpperCase(),
        cnp: cnp.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city,
        county,
        signatureDataUrl,
        distributeFor2Years,
        consentBorderou,
        hp_website: hpWebsite,
      };

      const res = await fetch("/api/formular-230", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "A apărut o problemă la salvarea formularului.");
      }

      setIsSubmitted(true);
      if (onCompleted) {
        onCompleted();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Eroare necunoscută la trimitere";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wizard Step Indicator */}
      <div className="flex items-center justify-between border-b border-amber-900/15 pb-4 print:hidden">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 1 ? "bg-amber-600 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            1
          </div>
          <span className="text-xs font-serif font-bold text-slate-900 hidden sm:inline">
            Date Personale
          </span>
        </div>

        <div className="h-0.5 w-8 sm:w-16 bg-amber-900/20" />

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 2 ? "bg-amber-600 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            2
          </div>
          <span className="text-xs font-serif font-bold text-slate-900 hidden sm:inline">
            Semnătură Digitală
          </span>
        </div>

        <div className="h-0.5 w-8 sm:w-16 bg-amber-900/20" />

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step === 3 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            3
          </div>
          <span className="text-xs font-serif font-bold text-slate-900 hidden sm:inline">
            PDF & Finalizare
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Date de identificare */}
      {step === 1 && (
        <form onSubmit={handleNextToStep2} className="space-y-4">
          {/* Honeypot invizibil pentru neutralizarea boților automați */}
          <div style={{ display: "none" }} aria-hidden="true">
            <label htmlFor="f230_hp_website">Nu completați acest câmp</label>
            <input
              id="f230_hp_website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={hpWebsite}
              onChange={(e) => setHpWebsite(e.target.value)}
            />
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-600/25 text-xs text-amber-950 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Redirecționare 3,5% din impozit:</strong> Nu te costă niciun leu în plus. Sunt bani din impozitul tău pe salariu care altfel rămân la stat și pe care îi redirecționezi către reabilitarea subsolurilor de bloc din Ploiești.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Nume de Familie <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ex: Ionescu"
                className="w-full px-3 py-2 rounded-xl border border-amber-900/20 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Iniț. Tată
              </label>
              <input
                type="text"
                maxLength={2}
                value={initialaTata}
                onChange={(e) => setInitialaTata(e.target.value.toUpperCase())}
                placeholder="Ex: M"
                className="w-full px-3 py-2 rounded-xl border border-amber-900/20 text-xs bg-white text-center focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium uppercase"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Prenume <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ex: Andrei"
                className="w-full px-3 py-2 rounded-xl border border-amber-900/20 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Cod Numeric Personal (CNP) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={13}
              value={cnp}
              onChange={(e) => setCnp(e.target.value.replace(/\D/g, ""))}
              placeholder="Ex: 1850312297123 (13 cifre)"
              className="w-full px-3 py-2 rounded-xl border border-amber-900/20 text-xs bg-white font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Necesar conform legislației fiscale ANAF pentru identificarea contribuabilului.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Telefon de Contact <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 0722123456"
                className="w-full px-3 py-2 rounded-xl border border-amber-900/20 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Adresă de Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: andrei.ionescu@gmail.com"
                className="w-full px-3 py-2 rounded-xl border border-amber-900/20 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Adresă de Domiciliu (din C.I.) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Str. Malu Roșu nr. 8, Bl. 32, Sc. B, Ap. 21"
              className="w-full px-3 py-2 rounded-xl border border-amber-900/20 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Oraș</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-900/20 text-xs bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Județ</label>
              <input
                type="text"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-900/20 text-xs bg-white font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] mt-4"
          >
            <span>Pasul Următor: Semnătură Digitală</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* STEP 2: Semnătură pe ecran & confirmare date ONG */}
      {step === 2 && (
        <div className="space-y-5">
          {/* Casetă date ONG precompletate */}
          <div className="p-4 rounded-xl bg-white border border-amber-900/15 shadow-sm space-y-2 text-xs">
            <div className="flex items-center gap-2 font-serif font-bold text-amber-900 uppercase text-[11px] tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Datele ONG-ului sunt precompletate automat pe formular:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="font-bold text-[#071330]">Entitate:</span> {ongConfig.name}
              </div>
              <div>
                <span className="font-bold text-[#071330]">CIF:</span> {ongConfig.cif}
              </div>
              <div>
                <span className="font-bold text-[#071330]">Cont IBAN:</span> {ongConfig.iban}
              </div>
              <div>
                <span className="font-bold text-[#071330]">Procent:</span> {ongConfig.percentage} (pentru 2 ani)
              </div>
            </div>
          </div>

          {/* Signature Canvas */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Apasă și desenează semnătura ta mai jos <span className="text-rose-500">*</span>
            </label>
            <SignatureCanvas
              onSave={(url) => setSignatureDataUrl(url)}
              onClear={() => setSignatureDataUrl("")}
            />
          </div>

          {/* Acord Borderou ANAF */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#FAF7F2] border border-amber-900/15 text-xs">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={consentBorderou}
                onChange={(e) => setConsentBorderou(e.target.checked)}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-slate-700 text-[11px] leading-relaxed">
                Împuternicesc Asociația Viziune Urbană Ploiești să depună formularul în numele meu la ANAF pe bază de borderou oficial (recomandat, fără să mai mergi tu la administrația fiscală).
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={distributeFor2Years}
                onChange={(e) => setDistributeFor2Years(e.target.checked)}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-slate-700 text-[11px] leading-relaxed">
                Opțiune de redirecționare valabilă pentru o perioadă de <strong>2 ani fiscali</strong> (art. 79 alin. (3) Codul Fiscal).
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-amber-900/10">
              <input
                type="checkbox"
                checked={consentGdpr}
                onChange={(e) => setConsentGdpr(e.target.checked)}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-slate-700 text-[11px] leading-relaxed">
                Sunt de acord cu prelucrarea datelor mele cu caracter personal (inclusiv CNP și semnătură) exclusiv în scopul depunerii Formularului 230 la ANAF, conform{" "}
                <Link
                  href="/confidentialitate"
                  target="_blank"
                  className="text-amber-800 underline hover:text-amber-950 font-bold"
                >
                  Politicii de Confidențialitate (GDPR)
                </Link>.
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-900/20 text-slate-700 hover:bg-slate-50 font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Înapoi</span>
            </button>

            <button
              type="button"
              onClick={handleNextToStep3}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98]"
            >
              <span>Generare Formular 230 PDF</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Vizualizare Document Oficial, Print & Trimitere */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Mesaj de confirmare dacă a fost trimis */}
          {isSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-3 shadow-md print:hidden">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-serif font-black text-emerald-950">
                Formularul 230 a fost înregistrat cu succes!
              </h3>
              <p className="text-xs text-emerald-900 max-w-md mx-auto leading-relaxed">
                Mulțumim, {firstName}! Asociația Viziune Urbană Ploiești va include formularul tău în borderoul centralizat pentru organul fiscal. Banii vor ajuta direct la modernizarea subsolurilor de bloc din oraș.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white border border-amber-900/15 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
              <div>
                <h4 className="text-xs font-bold text-[#071330]">
                  Formularul tău este gata semnat și validat!
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Poți descărca PDF-ul pentru tine sau poți trimite formularul asociației să-l depună pentru tine.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-3 py-2 rounded-lg border border-amber-900/20 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                >
                  Modifică
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitToAssociation}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow-md transition-all"
                >
                  {isSubmitting ? (
                    <span>Se trimite...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Trimite către Asociație (Depunere ANAF)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* The Actual Official ANAF Formular 230 Layout */}
          <Formular230OfficialDoc
            formData={{
              lastName,
              firstName,
              initialaTata,
              cnp,
              phone,
              email,
              address,
              city,
              county,
              signatureDataUrl,
              distributeFor2Years,
            }}
            ongConfig={ongConfig}
          />
        </div>
      )}
    </div>
  );
}
