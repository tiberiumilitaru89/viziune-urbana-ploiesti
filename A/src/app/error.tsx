"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, MessageSquare } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    // Înregistrăm eroarea în consolă pentru diagnostic
    console.error("Next.js App Runtime Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[#FAF7F2] text-slate-900 font-sans">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-amber-900/15 text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 text-xs font-serif font-bold uppercase tracking-widest bg-amber-100 text-amber-900 rounded-full mb-3">
          Asociația Viziune Urbană Ploiești
        </span>

        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#071330] tracking-tight mb-3">
          A apărut o întrerupere temporară
        </h1>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
          Platforma nu a putut afișa această secțiune dintr-o eroare de încărcare. Te rugăm să reîncerci sau să ne contactezi direct pe WhatsApp pentru asistență.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-serif font-bold text-sm shadow-lg shadow-amber-900/20 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reîncearcă
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-serif font-bold text-sm transition-all"
          >
            <Home className="w-4 h-4" />
            Pagina Principală
          </Link>

          <a
            href="https://wa.me/40720015592"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-serif font-bold text-sm transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </a>
        </div>

        {error?.digest && (
          <p className="text-[11px] text-slate-400 mt-6 font-mono">
            Cod identificator: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
