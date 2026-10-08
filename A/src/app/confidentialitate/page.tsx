"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuditModal } from "@/components/modals/AuditModal";
import { DonationModal } from "@/components/modals/DonationModal";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  FileText,
  Mail,
  Scale,
  AlertTriangle,
  UserCheck,
  Clock,
  Server,
} from "lucide-react";

export default function ConfidentialitatePage() {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  return (
    <>
      <Navbar
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onOpenDonationModal={() => setIsDonationModalOpen(true)}
      />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Navigație Înapoi */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-amber-900 hover:text-amber-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Înapoi la pagina principală</span>
          </Link>
        </div>

        {/* Antet Pagină */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5EDE1] border border-amber-700/30 text-amber-900 text-xs font-serif font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-amber-800" />
            Protecția Datelor • Regulamentul (UE) 2016/679
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#071330] tracking-tight mb-4">
            Politică de Confidențialitate{" "}
            <span className="italic font-normal text-[#B5853F]">
              & Protecția Datelor (GDPR)
            </span>
          </h1>

          <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
            Asociația Viziune Urbană Ploiești respectă dreptul la viață privată și garantează securitatea datelor dumneavoastră cu caracter personal, în conformitate cu Regulamentul General privind Protecția Datelor (GDPR) și legislația națională aplicabilă.
          </p>
        </div>

        {/* Card Principal Conținut Legal */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white/90 backdrop-blur-md border border-amber-900/20 shadow-xl space-y-8 text-slate-800 text-sm leading-relaxed">
          {/* Secțiunea 1: Operatorul */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <Scale className="w-5 h-5 text-amber-700 shrink-0" />
              <h2>1. Identitatea și Datele de Contact ale Operatorului</h2>
            </div>
            <p>
              Operatorul datelor dumneavoastră cu caracter personal este <strong>Asociația Viziune Urbană Ploiești</strong>, asociație civică fără scop patrimonial, constituită în conformitate cu Ordonanța Guvernului nr. 26/2000 și Legea nr. 196/2018 privind înființarea, organizarea și funcționarea asociațiilor de proprietari:
            </p>
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-amber-900/15 text-xs space-y-1.5 font-mono text-slate-700">
              <div><strong>Denumire:</strong> Asociația Viziune Urbană Ploiești</div>
              <div><strong>Sediu:</strong> Municipiul Ploiești, Județul Prahova, România</div>
              <div><strong>E-mail oficial:</strong> viziuneurbanaploiesti@yahoo.com</div>
              <div><strong>Telefon de contact:</strong> 0720 015 592</div>
              <div><strong>Cont bancar (UniCredit Bank):</strong> RO94 BACX 0000 0042 3447 3000</div>
            </div>
          </section>

          {/* Secțiunea 2: Categoriile de date */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <FileText className="w-5 h-5 text-amber-700 shrink-0" />
              <h2>2. Categoriile de Date cu Caracter Personal Prelucrate</h2>
            </div>
            <p>
              În funcție de interacțiunea dumneavoastră cu platforma noastră, colectăm exclusiv datele strict necesare îndeplinirii scopurilor civice și legale:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
              <li>
                <strong>Pentru Redirecționarea a 3,5% din Impozit (Formularul 230 ANAF):</strong> Nume de familie, prenume, inițiala tatălui, Cod Numeric Personal (CNP), adresă completă de domiciliu, număr de telefon, adresă de e-mail și semnătura olografă digitalizată.
              </li>
              <li>
                <strong>Pentru Solicitarea Evaluării Tehnice a Subsolului (Audit Gratuit):</strong> Numele reprezentantului sau persoanei de contact (președinte / administrator / locatar), număr de telefon, e-mail, adresa imobilului/asociației de proprietari și detalii tehnice privind starea subsolului.
              </li>
              <li>
                <strong>Pentru Sponsorizări și Parteneriate:</strong> Nume/denumire companie, CIF/CUI, reprezentant legal, date de contact și sume destinate fondului civic conform Legii 32/1994.
              </li>
            </ul>
          </section>

          {/* Secțiunea 3: Regimul CNP-ului */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
              <h2>3. Regimul Special al Codului Numeric Personal (CNP)</h2>
            </div>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-700/20 text-xs sm:text-sm text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0" />
                <span>Garanție de protecție conform Legii nr. 190/2018 (art. 4)</span>
              </div>
              <p>
                Codul Numeric Personal este colectat <strong>strict și exclusiv</strong> în scopul completării cererii oficiale ANAF Formular 230. Conform normelor emise de Agenția Națională de Administrare Fiscală, identificarea contribuabilului pentru virarea cotei de 3,5% din impozitul pe venit este condiționată legal de specificarea CNP-ului.
              </p>
              <p className="font-semibold">
                Asociația Viziune Urbană Ploiești nu va comercializa, nu va înstrăina și nu va utiliza CNP-ul dumneavoastră în niciun alt scop, acesta fiind accesat exclusiv pentru depunerea borderourilor fiscale la ANAF Ploiești.
              </p>
            </div>
          </section>

          {/* Secțiunea 4: Temeiurile Juridice */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <UserCheck className="w-5 h-5 text-amber-700 shrink-0" />
              <h2>4. Temeiul Legal al Prelucrării</h2>
            </div>
            <p>Prelucrarea datelor dumneavoastră se întemeiază pe dispozițiile Articolului 6 din GDPR:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
              <li>
                <strong>Art. 6 alin. (1) lit. (a) – Consimțământul:</strong> acordat în mod expres prin transmiterea formularelor online și confirmarea opțiunii de direcționare a cotei de 3,5%.
              </li>
              <li>
                <strong>Art. 6 alin. (1) lit. (c) – Obligație Legală:</strong> raportarea și predarea formularelor 230 către organul fiscal competent (ANAF Ploiești / AJFP Prahova) conform Codului Fiscal (Legea 227/2015).
              </li>
              <li>
                <strong>Art. 6 alin. (1) lit. (b) – Demersuri Precontractuale:</strong> stabilirea detaliilor tehnice și realizarea constatărilor tehnice gratuite pentru asociațiile de proprietari care solicită intervenții.
              </li>
            </ul>
          </section>

          {/* Secțiunea 5: Perioada de Stocare */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <Clock className="w-5 h-5 text-amber-700 shrink-0" />
              <h2>5. Perioada de Păstrare a Datelor</h2>
            </div>
            <p>
              Datele transmise prin <strong>Formularul 230</strong> sunt arhivate pentru o perioadă deterministă de <strong>5 ani fiscali</strong>, conform termenului general de prescripție și de păstrare a documentelor justificative impus de <em>Codul de Procedură Fiscală (Legea nr. 207/2015)</em>.
            </p>
            <p>
              Datele de contact colectate pentru <strong>auditurile tehnice ale blocurilor</strong> sunt păstrate pe durata derulării evaluărilor și a execuției lucrărilor de subsol sau până la solicitarea de ștergere din partea reprezentantului asociației.
            </p>
          </section>

          {/* Secțiunea 6: Destinatari și Securitate */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <Server className="w-5 h-5 text-amber-700 shrink-0" />
              <h2>6. Destinatarii Datelor și Măsuri Tehnice de Securitate</h2>
            </div>
            <p>
              Datele sunt prelucrate în condiții de confidențialitate strictă și sunt accesibile doar personalului autorizat din cadrul asociației și partenerilor tehnici acreditați (în măsura necesară efectuării măsurătorilor din teren). Datele fiscale sunt transmise exclusiv către <strong>ANAF (Administrația Județeană a Finanțelor Publice Prahova)</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-amber-900/15 space-y-1">
                <span className="font-bold text-[#071330] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-700" /> Criptare End-to-End
                </span>
                <p className="text-slate-600">
                  Toate transmisiunile sunt securizate prin certificate TLS/SSL pe 256 de biți (HTTPS).
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-amber-900/15 space-y-1">
                <span className="font-bold text-[#071330] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Izolare Server-Side
                </span>
                <p className="text-slate-600">
                  Endpoint-urile publice nu expun PII; sesiunile administrative sunt validate prin token HMAC-SHA256.
                </p>
              </div>
            </div>
          </section>

          {/* Secțiunea 7: Drepturile Utilizatorilor */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#071330] font-serif font-bold text-lg border-b border-amber-900/15 pb-2">
              <UserCheck className="w-5 h-5 text-amber-700 shrink-0" />
              <h2>7. Drepturile Dumneavoastră Legale</h2>
            </div>
            <p>Conform GDPR, beneficiați de următoarele drepturi pe care le puteți exercita oricând:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Dreptul de acces:</strong> puteți solicita o confirmare dacă prelucrăm sau nu datele dumneavoastră.</li>
              <li><strong>Dreptul la rectificare:</strong> puteți cere corectarea datelor inexacte sau incomplete.</li>
              <li><strong>Dreptul la ștergere („dreptul de a fi uitat”):</strong> în limitele în care datele nu sunt impuse de o obligație fiscală legală.</li>
              <li><strong>Dreptul la restricționarea prelucrării:</strong> în cazurile prevăzute de art. 18 GDPR.</li>
              <li><strong>Dreptul de a vă retrage consimțământul:</strong> în orice moment, fără a afecta legalitatea prelucrării anterioare retragerii.</li>
              <li>
                <strong>Dreptul de a depune o plângere:</strong> la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP) — <em>B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București, <a href="https://www.dataprotection.ro/" target="_blank" rel="noopener noreferrer" className="text-amber-900 underline font-semibold">www.dataprotection.ro</a>, e-mail: anspdcp@dataprotection.ro</em>.
              </li>
            </ul>
          </section>

          {/* Secțiunea 8: Contact DPO / Protecția Datelor */}
          <section className="pt-4 border-t border-amber-900/15 space-y-2">
            <h3 className="font-serif font-bold text-[#071330] text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-700" />
              Exercitarea Drepturilor
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Pentru orice solicitare, rectificare sau întrebare referitoare la modul în care sunt prelucrate datele dumneavoastră, ne puteți contacta direct prin e-mail la{" "}
              <a href="mailto:viziuneurbanaploiesti@yahoo.com" className="text-amber-900 font-bold underline hover:text-amber-950">
                viziuneurbanaploiesti@yahoo.com
              </a>{" "}
              sau la numărul de telefon{" "}
              <a href="tel:0720015592" className="text-amber-900 font-bold hover:text-amber-950">
                0720 015 592
              </a>. Răspundem oricărei solicitări oficiale în termenul legal de maximum 30 de zile.
            </p>
          </section>
        </div>
      </main>

      <Footer />

      {/* Modale Funcționale */}
      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </>
  );
}
