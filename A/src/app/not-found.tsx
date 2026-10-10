import React from "react";
import Link from "next/link";
import { Compass, Home, PhoneCall } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[#FAF7F2] text-slate-900 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-amber-900/15 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Compass className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 text-xs font-serif font-bold uppercase tracking-widest bg-amber-100 text-amber-900 rounded-full mb-3">
          Eroare 404
        </span>

        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#071330] tracking-tight mb-3">
          Pagina nu a fost găsită
        </h1>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
          Adresa accesată nu există sau a fost mutată. Te invităm să accesezi pagina principală sau să ne contactezi pentru dosarul asociației tale.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-serif font-bold text-sm shadow-lg shadow-amber-900/20 transition-all"
          >
            <Home className="w-4 h-4" />
            Pagina Principală
          </Link>

          <a
            href="tel:+40720015592"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-serif font-bold text-sm transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            Contact Tehnic
          </a>
        </div>
      </div>
    </div>
  );
}
